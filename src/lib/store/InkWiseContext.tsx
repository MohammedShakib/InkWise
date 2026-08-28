"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { InkWiseSettings, PrintSettings, AnalysisResult } from '../image-processing/types';
import { createThumbnail } from '../image-processing/image-utils';

export type ImageStatus = 'Ready' | 'Processing' | 'Completed' | 'Failed';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  thumbnailUrl: string;
  status: ImageStatus;
  processedBlob?: Blob;
  processedUrl?: string;
  analysisBefore?: AnalysisResult;
  analysisAfter?: AnalysisResult;
  error?: string;
}

export interface ExportSettings {
  format: 'png' | 'jpeg' | 'webp';
  quality: number;
  prefix: string;
}

export interface PdfSettings {
  dpi: number;
  quality: 'high' | 'balanced' | 'small';
  pageRange: string;
}

interface InkWiseState {
  images: ImageItem[];
  selectedImageId: string | null;
  settings: InkWiseSettings;
  printSettings: PrintSettings;
  exportSettings: ExportSettings;
  pdfFile: File | null;
  pdfSettings: PdfSettings;
}

interface InkWiseContextType extends InkWiseState {
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearAll: () => void;
  selectImage: (id: string | null) => void;
  updateSettings: (settings: Partial<InkWiseSettings>) => void;
  updatePrintSettings: (settings: Partial<PrintSettings>) => void;
  updateExportSettings: (settings: Partial<ExportSettings>) => void;
  updateImageStatus: (id: string, updates: Partial<ImageItem>) => void;
  reorderImages: (oldIndex: number, newIndex: number) => void;
  resetSettings: () => void;
  setPdfFile: (file: File | null) => void;
  updatePdfSettings: (settings: Partial<PdfSettings>) => void;
}

const defaultSettings: InkWiseSettings = {
  blackPoint: 0,
  whitePoint: 245,
  gamma: 1,
  preset: "Standard"
};

const defaultPrintSettings: PrintSettings = {
  grayscale: false,
  increaseTextContrast: false,
  flattenTransparency: false,
};

const defaultExportSettings: ExportSettings = {
  format: 'png',
  quality: 0.95,
  prefix: 'clean_'
};

const defaultPdfSettings: PdfSettings = {
  dpi: 300,
  quality: 'high',
  pageRange: ''
};

const InkWiseContext = createContext<InkWiseContextType | null>(null);

function readStoredState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    if (!storedValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(storedValue) as Partial<T>;
    return { ...fallback, ...parsedValue };
  } catch (error) {
    console.error(`Error loading ${key}`, error);
    return fallback;
  }
}

export const InkWiseProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<InkWiseSettings>(() => readStoredState('inkwise_settings', defaultSettings));
  const [printSettings, setPrintSettings] = useState<PrintSettings>(() => readStoredState('inkwise_print_settings', defaultPrintSettings));
  const [exportSettings, setExportSettings] = useState<ExportSettings>(() => readStoredState('inkwise_export_settings', defaultExportSettings));

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfSettings, setPdfSettings] = useState<PdfSettings>(() => readStoredState('inkwise_pdf_settings', defaultPdfSettings));

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('inkwise_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('inkwise_print_settings', JSON.stringify(printSettings));
  }, [printSettings]);

  useEffect(() => {
    localStorage.setItem('inkwise_export_settings', JSON.stringify(exportSettings));
  }, [exportSettings]);

  useEffect(() => {
    localStorage.setItem('inkwise_pdf_settings', JSON.stringify(pdfSettings));
  }, [pdfSettings]);

  const addImages = useCallback(async (files: File[]) => {
    const newItems: ImageItem[] = [];
    
    for (const file of files) {
      const id = crypto.randomUUID();
      const thumbnailUrl = await createThumbnail(file);
      
      // We can get width/height by reading the image size temporarily
      // A quick object URL is fine
      const tempUrl = URL.createObjectURL(file);
      let width = 0;
      let height = 0;
      try {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // just skip if error
          img.src = tempUrl;
        });
        width = img.width;
        height = img.height;
      } finally {
        URL.revokeObjectURL(tempUrl);
      }
      
      newItems.push({
        id,
        file,
        name: file.name,
        size: file.size,
        width,
        height,
        thumbnailUrl,
        status: 'Ready'
      });
    }

    setImages(prev => {
      const updated = [...prev, ...newItems];
      if (!selectedImageId && updated.length > 0) {
        setSelectedImageId(updated[0].id);
      }
      return updated;
    });
  }, [selectedImageId]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => {
        if (img.id === id) {
          // Cleanup Object URLs to prevent memory leaks
          if (img.thumbnailUrl && img.thumbnailUrl.startsWith('blob:')) {
            URL.revokeObjectURL(img.thumbnailUrl);
          }
          if (img.processedUrl) {
            URL.revokeObjectURL(img.processedUrl);
          }
        }
        return img.id !== id;
      });
      
      if (selectedImageId === id) {
        setSelectedImageId(updated.length > 0 ? updated[0].id : null);
      }
      
      return updated;
    });
  }, [selectedImageId]);

  const clearAll = useCallback(() => {
    setImages(prev => {
      prev.forEach(img => {
        if (img.thumbnailUrl && img.thumbnailUrl.startsWith('blob:')) URL.revokeObjectURL(img.thumbnailUrl);
        if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
      });
      return [];
    });
    setSelectedImageId(null);
    setPdfFile(null);
  }, []);

  const selectImage = useCallback((id: string | null) => {
    setSelectedImageId(id);
  }, []);

  const updateSettings = useCallback((updates: Partial<InkWiseSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePrintSettings = useCallback((updates: Partial<PrintSettings>) => {
    setPrintSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateExportSettings = useCallback((updates: Partial<ExportSettings>) => {
    setExportSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updatePdfSettings = useCallback((updates: Partial<PdfSettings>) => {
    setPdfSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const updateImageStatus = useCallback((id: string, updates: Partial<ImageItem>) => {
    setImages(prev => prev.map(img => {
      if (img.id !== id) return img;

      if (updates.processedUrl && img.processedUrl && img.processedUrl !== updates.processedUrl) {
        URL.revokeObjectURL(img.processedUrl);
      }

      return { ...img, ...updates };
    }));
  }, []);

  const reorderImages = useCallback((oldIndex: number, newIndex: number) => {
    setImages(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(oldIndex, 1);
      result.splice(newIndex, 0, removed);
      return result;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    setPrintSettings(defaultPrintSettings);
    setExportSettings(defaultExportSettings);
  }, []);

  return (
    <InkWiseContext.Provider
      value={{
        images,
        selectedImageId,
        settings,
        printSettings,
        exportSettings,
        pdfFile,
        pdfSettings,
        addImages,
        removeImage,
        clearAll,
        selectImage,
        updateSettings,
        updatePrintSettings,
        updateExportSettings,
        updateImageStatus,
        reorderImages,
        resetSettings,
        setPdfFile,
        updatePdfSettings
      }}
    >
      {children}
    </InkWiseContext.Provider>
  );
};

export const useInkWise = () => {
  const context = useContext(InkWiseContext);
  if (!context) {
    throw new Error("useInkWise must be used within an InkWiseProvider");
  }
  return context;
};

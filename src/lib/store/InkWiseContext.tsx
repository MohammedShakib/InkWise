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
  suffix: string;
}

interface InkWiseState {
  images: ImageItem[];
  selectedImageId: string | null;
  settings: InkWiseSettings;
  printSettings: PrintSettings;
  exportSettings: ExportSettings;
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
  resetSettings: () => void;
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
  suffix: '_clean'
};

const InkWiseContext = createContext<InkWiseContextType | null>(null);

export const InkWiseProvider = ({ children }: { children: ReactNode }) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<InkWiseSettings>(defaultSettings);
  const [printSettings, setPrintSettings] = useState<PrintSettings>(defaultPrintSettings);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(defaultExportSettings);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('inkwise_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      
      const savedPrint = localStorage.getItem('inkwise_print_settings');
      if (savedPrint) setPrintSettings(JSON.parse(savedPrint));
      
      const savedExport = localStorage.getItem('inkwise_export_settings');
      if (savedExport) setExportSettings(JSON.parse(savedExport));
    } catch (e) {
      console.error("Error loading settings", e);
    }
  }, []);

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

  const updateImageStatus = useCallback((id: string, updates: Partial<ImageItem>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
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
        addImages,
        removeImage,
        clearAll,
        selectImage,
        updateSettings,
        updatePrintSettings,
        updateExportSettings,
        updateImageStatus,
        resetSettings
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

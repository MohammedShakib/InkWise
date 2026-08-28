import { ProcessRequest, ProcessResponse } from '../lib/image-processing/types';
import { applyLevels } from '../lib/image-processing/levels';
import { applyGrayscale, increaseTextContrast, flattenTransparency } from '../lib/image-processing/grayscale';
import { analyzeBackground } from '../lib/image-processing/analysis';

self.onmessage = (e: MessageEvent<ProcessRequest>) => {
  try {
    const { id, imageData, settings, printSettings } = e.data;
    
    // 1. Analyze BEFORE processing
    const analysisBefore = analyzeBackground(imageData.data);

    // 2. Pre-processing: flatten transparency if requested
    if (printSettings.flattenTransparency) {
      flattenTransparency(imageData.data);
    }

    // 3. Main processing: Levels
    applyLevels(
      imageData.data,
      settings.blackPoint,
      settings.whitePoint,
      settings.gamma
    );

    // 4. Post-processing: Grayscale & Contrast
    if (printSettings.grayscale) {
      applyGrayscale(imageData.data);
    }
    
    if (printSettings.increaseTextContrast) {
      increaseTextContrast(imageData.data);
    }
    
    // 5. Analyze AFTER processing
    const analysisAfter = analyzeBackground(imageData.data);
    
    const response: ProcessResponse = {
      id,
      imageData,
      analysisBefore,
      analysisAfter,
    };
    
    // Transfer ownership of the buffer back to the main thread for performance
    self.postMessage(response, { transfer: [imageData.data.buffer] });
  } catch (error: any) {
    self.postMessage({
      id: e.data.id,
      error: error.message || 'Unknown error during image processing',
    });
  }
};

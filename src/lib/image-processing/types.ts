export interface InkWiseSettings {
  blackPoint: number; // 0 - 100
  whitePoint: number; // 150 - 255
  gamma: number; // 0.5 - 2.0
  preset: "Standard" | "Light" | "Strong" | "Custom";
}

export interface PrintSettings {
  grayscale: boolean;
  increaseTextContrast: boolean;
  flattenTransparency: boolean;
}

export interface AnalysisResult {
  pureWhitePercentage: number;
  nearWhitePercentage: number;
}

export interface ProcessRequest {
  id: string;
  imageData: ImageData;
  settings: InkWiseSettings;
  printSettings: PrintSettings;
}

export interface ProcessResponse {
  id: string;
  imageData?: ImageData;
  analysisBefore?: AnalysisResult;
  analysisAfter?: AnalysisResult;
  error?: string;
}
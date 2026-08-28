import { AnalysisResult } from "./types";

export function analyzeBackground(data: Uint8ClampedArray): AnalysisResult {
  const length = data.length;
  let totalPixels = 0;
  let pureWhiteCount = 0;
  let nearWhiteCount = 0;
  
  for (let i = 0; i < length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    
    // Ignore fully transparent pixels in analysis
    if (a === 0) continue;

    totalPixels++;

    if (r === 255 && g === 255 && b === 255) {
      pureWhiteCount++;
      nearWhiteCount++; // Pure white is also near white
    } else if (r >= 245 && g >= 245 && b >= 245) {
      nearWhiteCount++;
    }
  }

  if (totalPixels === 0) {
    return { pureWhitePercentage: 0, nearWhitePercentage: 0 };
  }
  
  return {
    pureWhitePercentage: (pureWhiteCount / totalPixels) * 100,
    nearWhitePercentage: (nearWhiteCount / totalPixels) * 100,
  };
}

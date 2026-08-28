/**
 * Applies proper perceptual grayscale conversion to image data.
 */
export function applyGrayscale(data: Uint8ClampedArray) {
  const length = data.length;
  for (let i = 0; i < length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Standard perceptual luminance formula
    const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    
    data[i] = luminance;
    data[i + 1] = luminance;
    data[i + 2] = luminance;
  }
}

/**
 * Composites transparent pixels over a pure white background.
 */
export function flattenTransparency(data: Uint8ClampedArray) {
  const length = data.length;
  for (let i = 0; i < length; i += 4) {
    const a = data[i + 3];
    if (a < 255) {
      const alpha = a / 255;
      const invAlpha = 1 - alpha;
      
      // Composite over white (255)
      data[i] = Math.round(data[i] * alpha + 255 * invAlpha);
      data[i + 1] = Math.round(data[i + 1] * alpha + 255 * invAlpha);
      data[i + 2] = Math.round(data[i + 2] * alpha + 255 * invAlpha);
      data[i + 3] = 255; // Make fully opaque
    }
  }
}

/**
 * Increases text contrast by applying a basic S-curve or simple threshold mapping.
 * For MVP, we will use a simplified high-contrast stretch.
 */
export function increaseTextContrast(data: Uint8ClampedArray) {
  const length = data.length;
  for (let i = 0; i < length; i += 4) {
    for (let c = 0; c < 3; c++) {
      let val = data[i + c];
      // Darken darks, lighten lights slightly to make text pop
      if (val < 128) {
        val = Math.max(0, val - 20);
      } else {
        val = Math.min(255, val + 10);
      }
      data[i + c] = val;
    }
  }
}

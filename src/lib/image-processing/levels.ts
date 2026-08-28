/**
 * Applies a Levels adjustment to image data using continuous tonal remapping.
 * 
 * Formula for each channel:
 * normalized = clamp((input - blackPoint) / (whitePoint - blackPoint), 0, 1)
 * output = pow(normalized, 1 / gamma) * 255
 */
export function applyLevels(
  data: Uint8ClampedArray,
  blackPoint: number,
  whitePoint: number,
  gamma: number
) {
  // Precompute lookup table (LUT) for performance
  const lut = new Uint8Array(256);
  
  for (let i = 0; i < 256; i++) {
    // Normalize input between 0 and 1 using black and white points
    let normalized = (i - blackPoint) / (whitePoint - blackPoint);
    
    // Clamp between 0 and 1
    normalized = Math.max(0, Math.min(1, normalized));
    
    // Apply gamma correction
    let output = Math.pow(normalized, 1 / gamma);
    
    // Scale back to 0-255
    lut[i] = Math.round(output * 255);
  }

  // Apply LUT to all pixels (ignoring alpha channel)
  const length = data.length;
  for (let i = 0; i < length; i += 4) {
    data[i] = lut[data[i]];         // R
    data[i + 1] = lut[data[i + 1]]; // G
    data[i + 2] = lut[data[i + 2]]; // B
    // data[i + 3] is Alpha, preserve it
  }
}

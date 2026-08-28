import { applyLevels } from '../levels';
import { describe, it, expect } from 'vitest';

describe('applyLevels', () => {
  it('should correctly map pixels with white point 245', () => {
    // Array: [R, G, B, A] for different test pixels
    const data = new Uint8ClampedArray([
      0, 0, 0, 255,           // Black
      240, 240, 240, 255,     // Near white but below 245
      245, 245, 245, 255,     // Exact white point
      250, 250, 250, 255,     // Above white point
      255, 255, 255, 255,     // Pure white
    ]);

    applyLevels(data, 0, 245, 1);

    // 0 -> 0
    expect(data[0]).toBe(0);
    
    // 240 -> approx 250
    // (240 / 245) * 255 = 249.79 => 250
    expect(data[4]).toBe(250);
    
    // 245 -> 255
    expect(data[8]).toBe(255);
    
    // 250 -> 255 (clamped)
    expect(data[12]).toBe(255);
    
    // 255 -> 255
    expect(data[16]).toBe(255);
    
    // Alpha channels should be untouched
    expect(data[3]).toBe(255);
    expect(data[7]).toBe(255);
  });
});

/**
 * Helper functions to decode images, create thumbnails, and encode back to Blobs.
 */

// Basic Canvas helper to handle fallback if OffscreenCanvas is unavailable
function getCanvas(width: number, height: number): { canvas: HTMLCanvasElement | OffscreenCanvas; ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D } {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
    return { canvas, ctx };
  } else {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    return { canvas, ctx };
  }
}

export async function fileToImageData(file: File): Promise<ImageData> {
  const url = URL.createObjectURL(file);
  try {
    let img: ImageBitmap | HTMLImageElement;
    if (typeof createImageBitmap !== 'undefined') {
      img = await createImageBitmap(file);
    } else {
      const htmlImg = new Image();
      await new Promise((resolve, reject) => {
        htmlImg.onload = resolve;
        htmlImg.onerror = reject;
        htmlImg.src = url;
      });
      img = htmlImg;
    }

    const { canvas, ctx } = getCanvas(img.width, img.height);
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, img.width, img.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function createThumbnail(file: File, maxSize: number = 300): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    let img: ImageBitmap | HTMLImageElement;
    if (typeof createImageBitmap !== 'undefined') {
      img = await createImageBitmap(file);
    } else {
      const htmlImg = new Image();
      await new Promise((resolve, reject) => {
        htmlImg.onload = resolve;
        htmlImg.onerror = reject;
        htmlImg.src = url;
      });
      img = htmlImg;
    }

    let width = img.width;
    let height = img.height;
    
    if (width > height) {
      if (width > maxSize) {
        height = Math.round(height * (maxSize / width));
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = Math.round(width * (maxSize / height));
        height = maxSize;
      }
    }

    const { canvas, ctx } = getCanvas(width, height);
    ctx.drawImage(img, 0, 0, width, height);

    if (canvas instanceof OffscreenCanvas) {
      const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
      return URL.createObjectURL(blob);
    } else {
      return (canvas as HTMLCanvasElement).toDataURL('image/jpeg', 0.8);
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function imageDataToBlob(imageData: ImageData, format: 'png' | 'jpeg' | 'webp' = 'png', quality: number = 0.95): Promise<Blob> {
  const { canvas, ctx } = getCanvas(imageData.width, imageData.height);
  ctx.putImageData(imageData, 0, 0);
  
  const mimeType = `image/${format}`;
  
  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: mimeType, quality });
  } else {
    return new Promise((resolve, reject) => {
      (canvas as HTMLCanvasElement).toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas to Blob failed'));
        },
        mimeType,
        quality
      );
    });
  }
}

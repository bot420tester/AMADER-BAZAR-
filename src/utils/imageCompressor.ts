/**
 * Client-side Image Optimization Utility
 * 
 * Automatically scales down and compresses image files (from smartphones, cameras, or PCs)
 * into lightweight, high-resolution JPEG DataURLs (typically 30KB - 70KB).
 * 
 * This prevents Firestore's 1MB hard document limit (INVALID_ARGUMENT)
 * and localStorage's 5MB quota limit from failing during product creation or editing.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compress a File object using HTML5 Canvas
 */
export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<string> {
  const { maxWidth = 900, maxHeight = 900, quality = 0.75 } = options;

  // If not an image, fallback to standard FileReader
  if (!file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            resolve(result);
            return;
          }

          // Fill white background for transparent PNGs converted to JPEG
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Export as optimized JPEG
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          console.warn('Canvas compression failed, falling back to original:', err);
          resolve(result);
        }
      };

      img.onerror = () => {
        resolve(result);
      };

      img.src = result;
    };

    reader.onerror = () => {
      resolve('');
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress a raw Base64 Data URL if it exceeds a size threshold (e.g. > 100KB)
 */
export async function compressBase64Image(
  dataUrl: string,
  options: ImageCompressionOptions = {}
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }

  // If already small (under 100KB), keep as is
  if (dataUrl.length < 100_000) {
    return dataUrl;
  }

  const { maxWidth = 900, maxHeight = 900, quality = 0.75 } = options;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch {
        resolve(dataUrl);
      }
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Ensures galleryImages has no duplicate URLs or oversized duplicates of the primary image.
 * Caps gallery at max 6 images and deduplicates.
 */
export function sanitizeProductGallery(
  primaryImage: string,
  galleryImages?: string[]
): { image: string; galleryImages: string[] } {
  const finalPrimary = primaryImage || (galleryImages && galleryImages.length > 0 ? galleryImages[0] : '');
  
  if (!galleryImages || galleryImages.length === 0) {
    return {
      image: finalPrimary,
      galleryImages: finalPrimary ? [finalPrimary] : [],
    };
  }

  // Deduplicate gallery
  const unique: string[] = [];
  for (const img of galleryImages) {
    const trimmed = img.trim();
    if (trimmed && !unique.includes(trimmed)) {
      unique.push(trimmed);
    }
  }

  // Ensure primary image is included first
  if (finalPrimary && !unique.includes(finalPrimary)) {
    unique.unshift(finalPrimary);
  }

  // Limit to max 6 images to guarantee lightweight payloads
  const capped = unique.slice(0, 6);

  return {
    image: finalPrimary,
    galleryImages: capped,
  };
}

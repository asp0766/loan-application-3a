export interface CompressionResult {
  blob: Blob;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
}

/**
 * Client-side image compression using Canvas API according to Section C4 specs
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  initialQuality: number = 0.7,
  maxSizeBytes: number = 2 * 1024 * 1024 // 2MB
): Promise<CompressionResult> {
  // If not an image (e.g. PDF), do not compress
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files (JPG, PNG) can be compressed with the Canvas API.');
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      try {
        let width = img.width;
        let height = img.height;

        // Scale down maintaining aspect ratio if width exceeds maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to acquire canvas 2D rendering context'));
        }

        // Draw image on white background (in case of transparent PNG)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Helper to convert canvas to blob with given quality
        const getBlob = (quality: number): Promise<Blob> => {
          return new Promise((res, rej) => {
            canvas.toBlob(
              (blob) => {
                if (blob) res(blob);
                else rej(new Error('Canvas toBlob conversion failed'));
              },
              'image/jpeg',
              quality
            );
          });
        };

        let currentQuality = initialQuality;
        let blob = await getBlob(currentQuality);

        // If still > 2MB, recursively reduce quality by 0.1 until it fits or quality reaches 0.3
        while (blob.size > maxSizeBytes && currentQuality > 0.3) {
          currentQuality = Math.max(0.3, currentQuality - 0.1);
          blob = await getBlob(currentQuality);
        }

        // Convert blob to Data URL for preview and draft storage
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          const originalSize = file.size;
          const compressedSize = blob.size;
          const ratio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

          resolve({
            blob,
            dataUrl,
            originalSize,
            compressedSize,
            compressionRatio: Math.max(0, ratio),
            width,
            height,
          });
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objectUrl;
  });
}

/**
 * Format bytes into human readable format (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

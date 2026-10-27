import { AGENTS_IMAGE_MAX_BYTES } from '../agentsFiles';
import { fitImageDimensions } from './agentAttachments';

const MAX_EDGES = [2048, 1600, 1280, 1024];

const encode = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

/**
 * Re-encodes a large photo or screenshot so the model receives it as media:
 * the backend only shares images up to 2 MiB. JPEG on a white background is
 * accepted by every supported provider (WebP is not).
 */
export const resizeAgentsImage = async (
  file: File,
  maxBytes: number = AGENTS_IMAGE_MAX_BYTES,
): Promise<File> => {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('Images must be at most 2 MiB. Resize it and retry.');
  }
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('This image could not be read.');
  });
  const base = file.name.replace(/\.[^.]+$/, '') || 'image';
  try {
    for (const edge of MAX_EDGES) {
      const { width, height } = fitImageDimensions(
        bitmap.width,
        bitmap.height,
        edge,
      );
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) break;
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);
      const blob = await encode(canvas, 'image/jpeg', 0.86);
      if (blob && blob.size <= maxBytes) {
        return new File([blob], `${base}.jpg`, {
          type: 'image/jpeg',
          lastModified: file.lastModified,
        });
      }
    }
  } finally {
    bitmap.close();
  }
  throw new Error('Images must be at most 2 MiB. Resize it and retry.');
};

import { readImage } from 'erxes-ui';
import type { IAttachment } from 'erxes-ui';

const attachmentBlob = async (attachment: IAttachment): Promise<Blob> => {
  const response = await fetch(readImage(attachment.url));
  if (!response.ok) throw new Error('Could not load the attachment');
  return response.blob();
};

const imageBlob = async (attachment: IAttachment): Promise<Blob> => {
  const blob = await attachmentBlob(attachment);
  if (blob.type === 'image/png') return blob;
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not copy this image');
    context.drawImage(bitmap, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error('Could not copy this image'));
      }, 'image/png');
    });
  } finally {
    bitmap.close();
  }
};

export const copyAttachment = async (
  attachment: IAttachment,
): Promise<void> => {
  if (!attachment.url) throw new Error('Attachment unavailable');
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error(
      'This browser cannot copy files. Open the attachment to save it.',
    );
  }
  const isImage =
    attachment.type?.startsWith('image') || attachment.type === 'sticker';
  const type = isImage ? 'image/png' : attachment.type;
  if (!type || (!isImage && !ClipboardItem.supports?.(type))) {
    throw new Error(
      'This file type cannot be copied by your browser. Open the attachment to save it.',
    );
  }
  // Start the write during the click gesture, before the download completes.
  await navigator.clipboard.write([
    new ClipboardItem({
      [type]: isImage ? imageBlob(attachment) : attachmentBlob(attachment),
    }),
  ]);
};

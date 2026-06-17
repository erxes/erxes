import { useState } from 'react';
import { ChatAttachment, PendingAttachment } from '~/modules/chat/types';
import { randomIdSuffix, uploadToStorage } from '~/modules/chat/utils';

// Composer attachment state + upload lifecycle. Shared by the composer chips
// and the chat-area drop overlay.
export const useAttachments = (enabled: boolean) => {
  const [pendingAtts, setPendingAtts] = useState<PendingAttachment[]>([]);

  const addFiles = (files: FileList | File[]) => {
    if (!enabled) return;
    const list = Array.from(files).slice(0, 10 - pendingAtts.length);

    for (let file of list) {
      // Clipboard screenshots all arrive as "image.png" — give each a distinct,
      // readable name before it becomes the stored file name.
      if (/^image\.\w+$/i.test(file.name || '') || !file.name) {
        const ext = (file.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
        const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
        file = new File([file], `screenshot-${stamp}.${ext}`, {
          type: file.type,
        });
      }

      const id = `att-${Date.now()}-${randomIdSuffix(6)}`;
      const entry: PendingAttachment = {
        id,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        previewUrl: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined,
        status: 'uploading',
      };
      setPendingAtts((prev) => [...prev, entry]);

      uploadToStorage(file)
        .then((key) => {
          setPendingAtts((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, url: key, status: 'done' as const } : a,
            ),
          );
        })
        .catch((err: unknown) => {
          setPendingAtts((prev) =>
            prev.map((a) =>
              a.id === id
                ? {
                    ...a,
                    status: 'error' as const,
                    error: (err as Error)?.message || 'Upload failed',
                  }
                : a,
            ),
          );
        });
    }
  };

  const removeAttachment = (id: string) => {
    setPendingAtts((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const clear = () => {
    pendingAtts.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    setPendingAtts([]);
  };

  const uploadsInFlight = pendingAtts.some((a) => a.status === 'uploading');

  const collectReady = (): ChatAttachment[] =>
    pendingAtts
      .filter((a) => a.status === 'done' && a.url)
      .map((a) => ({ url: a.url!, name: a.name, type: a.type, size: a.size }));

  return {
    pendingAtts,
    addFiles,
    removeAttachment,
    clear,
    uploadsInFlight,
    collectReady,
  };
};

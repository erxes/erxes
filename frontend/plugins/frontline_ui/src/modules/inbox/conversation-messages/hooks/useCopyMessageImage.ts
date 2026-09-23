import { useApolloClient } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { readImage, toast } from 'erxes-ui';
import { FRONTLINE_INSTAGRAM_COPY_IMAGE } from '@/integrations/instagram/graphql/queries/copyInstagramImage';

const pngBlob = async (blob: Blob): Promise<Blob> => {
  if (blob.type === 'image/png') return blob;
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not copy image');
    context.drawImage(bitmap, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) =>
        result ? resolve(result) : reject(new Error('Could not copy image')),
      'image/png');
    });
  } finally {
    bitmap.close();
  }
};

export const useCopyMessageImage = ({
  conversationId,
  messageId,
  url,
  isInstagram,
}: {
  conversationId: string;
  messageId: string;
  url: string;
  isInstagram: boolean;
}) => {
  const client = useApolloClient();
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    if (copying) return;
    setCopying(true);
    setCopied(false);
    clearTimeout(timer.current);
    try {
      const image = (async () => {
        let blob: Blob;
        try {
          const response = await fetch(readImage(url));
          if (!response.ok) throw new Error('Image unavailable');
          blob = await response.blob();
        } catch (error) {
          if (!isInstagram) throw error;
          const { data } = await client.query<{
            frontlineInstagramCopyImage: string;
          }>({
            query: FRONTLINE_INSTAGRAM_COPY_IMAGE,
            variables: { conversationId, messageId, url },
            fetchPolicy: 'no-cache',
          });
          const match = data.frontlineInstagramCopyImage.match(
            /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/,
          );
          if (!match) throw new Error('Image unavailable');
          const bytes = Uint8Array.from(
            atob(match[2]),
            (char) => char.charCodeAt(0),
          );
          blob = new Blob([bytes], { type: match[1] });
        }
        return pngBlob(blob);
      })();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': image }),
      ]);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: 'Could not copy image',
        description: 'The image is unavailable for copying. Open it to save it.',
        variant: 'destructive',
      });
    } finally {
      setCopying(false);
    }
  };
  return { copied, copying, copy };
};

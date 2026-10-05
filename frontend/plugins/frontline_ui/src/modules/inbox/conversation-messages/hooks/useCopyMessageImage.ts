import { useApolloClient, type ApolloClient } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { readImage, toast } from 'erxes-ui';
import { FRONTLINE_INSTAGRAM_COPY_IMAGE } from '@/integrations/instagram/graphql/queries/copyInstagramImage';
import { toPngBlob } from '@/inbox/conversation-messages/utils/copyAttachment';

type CopyMessageImageTarget = {
  conversationId: string;
  messageId: string;
  url: string;
};

const IMAGE_DATA_URL_PATTERN =
  /^data:(image\/(?:png|jpeg|webp|gif));base64,(.+)$/;

const dataUrlToBlob = (dataUrl: string): Blob => {
  const match = IMAGE_DATA_URL_PATTERN.exec(dataUrl);
  if (!match) throw new Error('Image unavailable');
  const bytes = Uint8Array.from(
    atob(match[2]),
    (char) => char.codePointAt(0) ?? 0,
  );
  return new Blob([bytes], { type: match[1] });
};

const fetchDirectImageBlob = async (url: string): Promise<Blob> => {
  const response = await fetch(readImage(url));
  if (!response.ok) throw new Error('Image unavailable');
  return response.blob();
};

const fetchProxiedImageBlob = async (
  client: ApolloClient<object>,
  variables: CopyMessageImageTarget,
): Promise<Blob> => {
  const { data } = await client.query<{ frontlineInstagramCopyImage: string }>({
    query: FRONTLINE_INSTAGRAM_COPY_IMAGE,
    variables,
    fetchPolicy: 'no-cache',
  });
  return dataUrlToBlob(data.frontlineInstagramCopyImage);
};

export const useCopyMessageImage = (target: CopyMessageImageTarget) => {
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
      const image = fetchDirectImageBlob(target.url)
        .catch(() => fetchProxiedImageBlob(client, target))
        .then(toPngBlob);
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': image }),
      ]);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: 'Could not copy image',
        description:
          'The image is unavailable for copying. Open it to save it.',
        variant: 'destructive',
      });
    } finally {
      setCopying(false);
    }
  };
  return { copied, copying, copy };
};

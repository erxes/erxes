import { readImage } from 'erxes-ui';

import { IMessage } from '@/inbox/types/Conversation';

type JsonRecord = Record<string, unknown>;

const isJsonRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const inlineContentToText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(inlineContentToText).join('');
  if (!isJsonRecord(value)) return '';
  if (typeof value.text === 'string') return value.text;
  return inlineContentToText(value.content);
};

const blockToText = (value: unknown): string => {
  if (!isJsonRecord(value)) return inlineContentToText(value);

  const content = inlineContentToText(value.content);
  const children = Array.isArray(value.children)
    ? value.children.map(blockToText).filter(Boolean).join('\n')
    : '';

  return [content, children].filter(Boolean).join('\n');
};

const parseBlockNoteText = (content: string) => {
  try {
    const parsed: unknown = JSON.parse(content);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(blockToText).join('\n').trim();
  } catch {
    return null;
  }
};

export const messageToPlainText = (content?: string) => {
  if (!content) return '';

  const blockNoteText = parseBlockNoteText(content);
  if (blockNoteText !== null) return blockNoteText;

  const document = new DOMParser().parseFromString(content, 'text/html');
  return (document.body.textContent || '').trim();
};

export const serializeInternalNote = (
  text: string,
  originalContent?: string,
) => {
  let originalBlock: JsonRecord | undefined;

  try {
    const parsed: unknown = JSON.parse(originalContent || '');
    if (Array.isArray(parsed) && isJsonRecord(parsed[0])) {
      originalBlock = parsed[0];
    }
  } catch {
    originalBlock = undefined;
  }

  const props = isJsonRecord(originalBlock?.props)
    ? originalBlock.props
    : {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      };

  return JSON.stringify(
    text.split('\n').map((line, index) => ({
      id:
        index === 0 && typeof originalBlock?.id === 'string'
          ? originalBlock.id
          : crypto.randomUUID(),
      type: 'paragraph',
      props,
      content: [{ type: 'text', text: line, styles: {} }],
      children: [],
    })),
  );
};

const convertImageToPng = async (blob: Blob) => {
  if (blob.type === 'image/png') return blob;

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((pngBlob) => {
      if (pngBlob) resolve(pngBlob);
      else reject(new Error('Could not convert image'));
    }, 'image/png');
  });
};

export const copyImageToClipboard = async (url: string) => {
  const resolvedUrl = readImage(url);

  try {
    const response = await fetch(resolvedUrl);
    if (!response.ok) throw new Error('Could not load image');

    const pngBlob = await convertImageToPng(await response.blob());
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': pngBlob }),
    ]);
    return 'image' as const;
  } catch {
    await navigator.clipboard.writeText(resolvedUrl);
    return 'link' as const;
  }
};

export const getOptimisticMessage = (
  message: IMessage,
  fields: Partial<IMessage>,
) => ({
  __typename: 'ConversationMessage',
  ...message,
  ...fields,
});

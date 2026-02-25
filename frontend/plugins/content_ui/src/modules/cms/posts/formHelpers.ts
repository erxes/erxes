import { Block } from '@blocknote/core';

export const convertHTMLToBlocks = (htmlContent: string): Block[] => {
  if (!htmlContent || htmlContent.trim() === '') {
    return [
      {
        id: crypto.randomUUID(),
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [],
        children: [],
      } as any,
    ];
  }
  const parser = new DOMParser();

  const doc = parser.parseFromString(htmlContent, 'text/html');
  const container = doc.body;
  const blocks: Block[] = [] as any;
  const children = Array.from(container.children);
  if (children.length === 0) {
    const textContent = container.textContent || container.innerText || '';
    if (textContent.trim()) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        } as any,
        content: [{ type: 'text', text: textContent, styles: {} } as any],
        children: [],
      } as any);
    }
  } else {
    children.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const textContent = el.textContent || '';
      if (!textContent.trim()) return;
      let blockType: any = 'paragraph';
      const props: any = {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      };
      if (tag.match(/^h[1-6]$/)) {
        blockType = 'heading';
        props.level = Number.parseInt(tag.charAt(1));
      }
      blocks.push({
        id: crypto.randomUUID(),
        type: blockType,
        props,
        content: [{ type: 'text', text: textContent, styles: {} }],
        children: [],
      } as any);
    });
  }
  return blocks.length > 0
    ? (blocks as any)
    : ([
        {
          id: crypto.randomUUID(),
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: [],
          children: [],
        },
      ] as any);
};

export const formatInitialContent = (content?: string): string | undefined => {
  if (!content || content.trim() === '') return undefined;
  if (content.startsWith('[')) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return content;
    } catch (error) {
      console.warn('Failed to parse content as JSON:', error);
    }
  }
  if (content.includes('<') && content.includes('>')) {
    const blocks = convertHTMLToBlocks(content);
    return JSON.stringify(blocks);
  }
  const blocks = convertHTMLToBlocks(`<p>${content}</p>`);
  return JSON.stringify(blocks);
};

export const makeAttachmentFromUrl = (url?: string | null) => {
  if (!url) return undefined;
  const name = url.split('/').pop() || 'file';
  return { url, name };
};

export const normalizeAttachment = (value: any) => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    return makeAttachmentFromUrl(value);
  }

  const url = value.url as string | undefined;
  if (!url) return undefined;

  const name =
    (value.name as string | undefined) || url.split('/').pop() || 'file';

  return {
    url,
    name,
    type: value.type,
    size: value.size,
    duration: value.duration,
  };
};

export const makeAttachmentArrayFromUrls = (urls?: (string | null)[]) => {
  return (urls || [])
    .filter(Boolean)
    .map((u) => makeAttachmentFromUrl(u as string))
    .filter(Boolean);
};

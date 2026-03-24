interface ManualInlineContent {
  type: string;
  text: string;
  styles: Record<string, boolean>;
}

const escapeHtml = (str: string): string =>
  str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const convertHTMLToBlocks = (htmlContent: string): Block[] => {
  if (!htmlContent || htmlContent.trim() === '') {
    return [emptyParagraph()];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const container = doc.body;
  const blocks: ManualBlock[] = [];
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
        },
        content: [{ type: 'text', text: textContent, styles: {} }],
        children: [],
      });
    }
  } else {
    children.forEach((el) => {
      const tag = el.tagName.toLowerCase();

      if (tag === 'img') {
        const url = (el as HTMLImageElement).src;
        if (!url) return;
        blocks.push({
          id: crypto.randomUUID(),
          type: 'image',
          props: {
            backgroundColor: 'default',
            textAlignment: 'left',
            url,
            name: '',
            caption: '',
            showPreview: true,
          },
          content: [],
          children: [],
        });
        return;
      }

      if (tag === 'figure') {
        const img = el.querySelector('img');
        if (!img) return;
        const caption = el.querySelector('figcaption')?.textContent || '';
        blocks.push({
          id: crypto.randomUUID(),
          type: 'image',
          props: {
            backgroundColor: 'default',
            textAlignment: 'left',
            url: img.src,
            name: '',
            caption,
            showPreview: true,
          },
          content: [],
          children: [],
        });
        return;
      }

      const textContent = el.textContent || '';
      if (!textContent.trim()) return;

      const blockType = tag.match(/^h[1-6]$/) ? 'heading' : 'paragraph';
      const props: ManualBlockProps = {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      };
      if (blockType === 'heading') {
        props.level = Number.parseInt(tag.charAt(1));
      }

      blocks.push({
        id: crypto.randomUUID(),
        type: blockType,
        props,
        content: [{ type: 'text', text: textContent, styles: {} }],
        children: [],
      });
    });
  }

  return blocks.length > 0 ? blocks : [emptyParagraph()];
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
  const blocks = convertHTMLToBlocks(`<p>${escapeHtml(content)}</p>`);
  return JSON.stringify(blocks);
};

export const makeAttachmentFromUrl = (url?: string | null) => {
  if (!url) return undefined;
  const name = url.split('/').pop() || 'file';
  return { url, name };
};

export const normalizeAttachment = (
  value: AttachmentInput | string | null | undefined,
) => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    return makeAttachmentFromUrl(value);
  }

  const url = value.url;
  if (!url) return undefined;

  const name = value.name || url.split('/').pop() || 'file';

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
    .filter(Boolean) as { url: string; name: string }[];
};

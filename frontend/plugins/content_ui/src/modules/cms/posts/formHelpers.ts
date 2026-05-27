import DOMPurify from 'dompurify';

/**
 * Represents the manual inline content of a block.
 */
export interface ManualInlineContent {
  type: string;
  text: string;
  styles: Record<string, boolean>;
}

/**
 * Base properties shared across all block types.
 */
export interface BaseBlockProps {
  textColor: string;
  backgroundColor: string;
  textAlignment: string;
}

/**
 * Properties for a paragraph block.
 */
export type ParagraphBlockProps = BaseBlockProps;

/**
 * Properties for a heading block.
 */
export interface HeadingBlockProps extends BaseBlockProps {
  level: number;
}

/**
 * Properties for an image block.
 */
export interface ImageBlockProps extends BaseBlockProps {
  url: string;
  name: string;
  caption: string;
  showPreview: boolean;
  previewWidth?: number;
  imageStyle?: 'normal' | 'wide';
}

/**
 * Union type representing all possible block properties.
 */
export type BlockProps =
  | ParagraphBlockProps
  | HeadingBlockProps
  | ImageBlockProps;

/**
 * Represents an attachment input with metadata.
 */
export interface AttachmentInput {
  url: string;
  name: string;
  type?: string;
  size?: number;
  duration?: number;
}

/**
 * Represents a structured block of content.
 */
export interface Block {
  id: string;
  type: string;
  props?: BlockProps;
  content: ManualInlineContent[];
  children: Block[];
}

/**
 * Generates an empty paragraph block.
 *
 * @returns A new empty paragraph block instance.
 */
const emptyParagraph = (): Block => ({
  id: crypto.randomUUID(),
  type: 'paragraph',
  props: {
    textColor: 'default',
    backgroundColor: 'default',
    textAlignment: 'left',
  },
  content: [{ type: 'text', text: '', styles: {} }],
  children: [],
});

/**
 * Escapes characters in a string to safe HTML entities.
 *
 * @param str - The raw string to escape.
 * @returns The HTML-escaped string.
 */
const escapeHtml = (str: string): string =>
  str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

/**
 * Extracts the image style ('normal' or 'wide') from an element.
 *
 * @param element - The DOM element to inspect.
 * @returns The determined image style.
 */
const getImageStyleFromElement = (element: Element): 'normal' | 'wide' => {
  const explicitStyle =
    element.getAttribute('data-image-style') ||
    element
      .getAttribute('class')
      ?.match(/erxes-editor-image--(normal|wide)/)?.[1];

  return explicitStyle === 'wide' ? 'wide' : 'normal';
};

/**
 * Gets the preset preview width based on the image style.
 *
 * @param imageStyle - The style of the image.
 * @returns The width in pixels.
 */
const getPresetPreviewWidth = (imageStyle: 'normal' | 'wide'): number =>
  imageStyle === 'wide' ? 1080 : 720;

/**
 * Converts sanitized HTML content into an array of structured Block objects.
 * Sanitizes input HTML to prevent Cross-Site Scripting (XSS) attacks.
 *
 * @param htmlContent - The raw HTML string to convert.
 * @returns An array of parsed Block objects representing the content.
 */
export const convertHTMLToBlocks = (htmlContent: string): Block[] => {
  if (!htmlContent || htmlContent.trim() === '') {
    return [emptyParagraph()];
  }

  const cleanHTML = DOMPurify.sanitize(htmlContent, {
    ADD_ATTR: ['data-image-style'],
  });

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanHTML, 'text/html');
  const container = doc.body;
  const blocks: Block[] = [];
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
        const imgElement = el as HTMLImageElement;
        const url = imgElement.src;
        if (!url) return;
        const imageStyle = getImageStyleFromElement(imgElement);
        blocks.push({
          id: crypto.randomUUID(),
          type: 'image',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
            url,
            name: '',
            caption: '',
            showPreview: true,
            previewWidth: imgElement.width || getPresetPreviewWidth(imageStyle),
            imageStyle,
          } as ImageBlockProps,
          content: [],
          children: [],
        });
        return;
      }

      if (tag === 'figure') {
        const img = el.querySelector('img');
        if (!img) return;
        const caption = el.querySelector('figcaption')?.textContent || '';
        const imageStyle = getImageStyleFromElement(el);
        blocks.push({
          id: crypto.randomUUID(),
          type: 'image',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
            url: img.src,
            name: '',
            caption,
            showPreview: true,
            previewWidth: img.width || getPresetPreviewWidth(imageStyle),
            imageStyle,
          } as ImageBlockProps,
          content: [],
          children: [],
        });
        return;
      }

      const textContent = el.textContent || '';
      if (!textContent.trim()) return;

      const blockType = tag.match(/^h[1-6]$/) ? 'heading' : 'paragraph';
      const props: BlockProps = {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      };
      if (blockType === 'heading') {
        (props as HeadingBlockProps).level =
          Number.parseInt(tag.charAt(1), 10) || 1;
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

/**
 * Formats initial content string into a JSON stringified array of Blocks.
 *
 * @param content - The optional initial content string.
 * @returns The formatted JSON string or undefined if empty.
 */
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

/**
 * Creates an attachment input object from a given URL.
 *
 * @param url - The URL string or null.
 * @returns An attachment input containing URL and extracted name, or undefined.
 */
export const makeAttachmentFromUrl = (
  url?: string | null,
): { url: string; name: string } | undefined => {
  if (!url) return undefined;
  const name = url.split('/').pop() || 'file';
  return { url, name };
};

/**
 * Normalizes various forms of attachment inputs into a standardized AttachmentInput.
 *
 * @param value - The input to normalize, can be a string, object, or undefined.
 * @returns A standardized AttachmentInput or undefined.
 */
export const normalizeAttachment = (
  value:
    | AttachmentInput
    | { url: string; name?: string; type?: string }
    | string
    | null
    | undefined,
): AttachmentInput | undefined => {
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
    size: (value as AttachmentInput).size,
    duration: (value as AttachmentInput).duration,
  };
};

/**
 * Processes an array of URLs and converts them into standardized AttachmentInputs.
 *
 * @param urls - An array of URL strings or nulls.
 * @returns An array of valid AttachmentInput objects.
 */
export const makeAttachmentArrayFromUrls = (
  urls?: (string | null)[],
): AttachmentInput[] => {
  const result: AttachmentInput[] = [];
  if (!urls) return result;

  for (const u of urls) {
    if (typeof u === 'string' && u.trim() !== '') {
      const attachment = makeAttachmentFromUrl(u);
      if (attachment) {
        result.push(attachment);
      }
    }
  }

  return result;
};

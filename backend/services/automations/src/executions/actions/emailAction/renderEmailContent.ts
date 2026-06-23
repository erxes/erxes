import { getEnv } from 'erxes-api-shared/utils';

type EmailInlineContent = {
  type?: string;
  text?: string;
  href?: string;
  content?: EmailInlineContent[];
  styles?: Record<string, unknown>;
  props?: Record<string, string>;
};

type EmailBlock = {
  type?: string;
  props?: Record<string, any>;
  content?: EmailInlineContent[] | { rows?: any[] };
  children?: EmailBlock[];
};

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const getPublicDomain = () => {
  const domain = getEnv({ name: 'DOMAIN', defaultValue: '' });

  if (!domain) {
    return '';
  }

  try {
    const parsed = new URL(domain);

    if (['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)) {
      return '';
    }

    return parsed.origin;
  } catch {
    return '';
  }
};

const normalizeImageUrl = (url: string) => {
  if (!url) {
    return '';
  }

  const publicDomain = getPublicDomain();

  if (url.startsWith('/') && publicDomain) {
    return `${publicDomain}${url}`;
  }

  try {
    const parsed = new URL(url);

    if (
      publicDomain &&
      ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)
    ) {
      return `${publicDomain}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    if (publicDomain) {
      return `${publicDomain}/read-file?key=${encodeURIComponent(url)}`;
    }
  }

  return url;
};

const inlineStylesToCss = (styles?: Record<string, unknown>) => {
  if (!styles) {
    return '';
  }

  const css: string[] = [];

  if (styles.bold) {
    css.push('font-weight: bold');
  }

  if (styles.italic) {
    css.push('font-style: italic');
  }

  if (styles.underline) {
    css.push('text-decoration: underline');
  }

  if (styles.strike || styles.strikethrough) {
    css.push('text-decoration: line-through');
  }

  if (styles.code) {
    css.push('font-family: monospace');
    css.push('background-color: #f4f4f4');
    css.push('padding: 2px 4px');
  }

  return css.join('; ');
};

const renderInlineContent = (content?: EmailInlineContent[]) => {
  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((item) => {
      if (item.type === 'attribute') {
        const value = item.props?.value || item.props?.name || '';

        return value ? `{{ ${value} }}` : '';
      }

      if (item.type === 'link') {
        return `<a href="${escapeHtml(
          item.href || '#',
        )}" style="color: #0066cc; text-decoration: underline">${renderInlineContent(
          item.content,
        )}</a>`;
      }

      const text = escapeHtml(item.text || '').replace(/\n/g, '<br />');
      const style = inlineStylesToCss(item.styles);

      return style ? `<span style="${style}">${text}</span>` : text;
    })
    .join('');
};

const renderImageBlock = (props: Record<string, any> = {}) => {
  const src = normalizeImageUrl(String(props.url || ''));

  if (!src) {
    return '';
  }

  const width = Math.min(Number(props.previewWidth) || 600, 600);
  const alt = escapeHtml(props.caption || props.name || '');
  const caption = props.caption
    ? `<div style="margin-top: 8px; font-size: 13px; color: #666;">${escapeHtml(
        props.caption,
      )}</div>`
    : '';

  return `<div style="margin: 16px 0;"><img src="${escapeHtml(
    src,
  )}" alt="${alt}" width="${width}" style="max-width: 100%; height: auto; display: block;" />${caption}</div>`;
};

const renderBlock = (block: EmailBlock): string => {
  const props = block.props || {};

  switch (block.type) {
    case 'paragraph': {
      const html = renderInlineContent(block.content as EmailInlineContent[]);

      return html ? `<p style="margin: 0 0 16px 0;">${html}</p>` : '';
    }

    case 'heading': {
      const level = Math.min(Math.max(Number(props.level) || 1, 1), 3);
      const html = renderInlineContent(block.content as EmailInlineContent[]);

      return `<h${level} style="margin: 16px 0 8px 0;">${html}</h${level}>`;
    }

    case 'bulletListItem':
    case 'numberedListItem': {
      return `<li>${renderInlineContent(
        block.content as EmailInlineContent[],
      )}</li>`;
    }

    case 'checkListItem': {
      const checkbox = props.checked ? '&#9745;' : '&#9744;';

      return `<p style="margin: 0 0 12px 0;">${checkbox} ${renderInlineContent(
        block.content as EmailInlineContent[],
      )}</p>`;
    }

    case 'image':
      return renderImageBlock(props);

    case 'documentPlaceholder':
      return props.documentId ? `{{ document.${props.documentId} }}` : '';

    default:
      return renderInlineContent(block.content as EmailInlineContent[]);
  }
};

export const renderEmailContent = (content?: string, fallbackHtml = '') => {
  if (!content) {
    return fallbackHtml || '';
  }

  try {
    const blocks = JSON.parse(content);

    if (!Array.isArray(blocks)) {
      return fallbackHtml || content;
    }

    return blocks.map(renderBlock).join('');
  } catch {
    return fallbackHtml || content;
  }
};

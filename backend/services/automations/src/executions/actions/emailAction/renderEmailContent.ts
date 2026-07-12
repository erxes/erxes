import { getEnv } from 'erxes-api-shared/utils';

type EmailInlineContent = {
  type?: string;
  text?: string;
  href?: string;
  content?: EmailInlineContent[];
  styles?: Record<string, unknown>;
  props?: Record<string, string>;
};

type EmailTableCell =
  | EmailInlineContent[]
  | {
      type?: string;
      content?: EmailInlineContent[];
      props?: {
        colspan?: number;
        rowspan?: number;
        backgroundColor?: string;
        textColor?: string;
        textAlignment?: string;
      };
    };

type EmailTableContent = {
  type?: string;
  headerRows?: number;
  rows?: Array<{ cells?: EmailTableCell[] }>;
};

type EmailBlock = {
  type?: string;
  props?: Record<string, any>;
  content?: EmailInlineContent[] | EmailTableContent;
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

const getInlineText = (content?: EmailInlineContent[] | EmailTableContent) => {
  if (!Array.isArray(content)) {
    return '';
  }

  return content.map((item) => item.text || '').join('');
};

const renderTableCell = (cell: EmailTableCell, isHeader: boolean) => {
  const isObjectCell = !Array.isArray(cell);
  const content = isObjectCell ? cell?.content : cell;
  const props = (isObjectCell ? cell?.props : undefined) || {};

  const styles = [
    'border: 1px solid #ddd',
    'padding: 8px 12px',
    `text-align: ${props.textAlignment || 'left'}`,
  ];

  if (props.backgroundColor && props.backgroundColor !== 'default') {
    styles.push(`background-color: ${props.backgroundColor}`);
  }

  if (props.textColor && props.textColor !== 'default') {
    styles.push(`color: ${props.textColor}`);
  }

  const tag = isHeader ? 'th' : 'td';
  const colspan =
    props.colspan && props.colspan > 1 ? ` colspan="${props.colspan}"` : '';
  const rowspan =
    props.rowspan && props.rowspan > 1 ? ` rowspan="${props.rowspan}"` : '';

  return `<${tag}${colspan}${rowspan} style="${styles.join(
    '; ',
  )}">${renderInlineContent(content as EmailInlineContent[])}</${tag}>`;
};

const hasTableCellContent = (cell: EmailTableCell) => {
  const content = Array.isArray(cell) ? cell : cell?.content;

  return renderInlineContent(content as EmailInlineContent[]).trim() !== '';
};

const renderTableBlock = (
  content?: EmailInlineContent[] | EmailTableContent,
) => {
  if (!content || Array.isArray(content)) {
    return '';
  }

  const rows = content.rows || [];
  const headerRows = content.headerRows || 0;
  const rowsHtml = rows
    .map((row, rowIndex) => ({ cells: row.cells || [], rowIndex }))
    // Editors usually leave a trailing empty row behind; skip rows where
    // every cell is empty so they don't show up in the email.
    .filter(({ cells }) => cells.some(hasTableCellContent))
    .map(({ cells, rowIndex }) => {
      const cellsHtml = cells
        .map((cell) => renderTableCell(cell, rowIndex < headerRows))
        .join('');

      return `<tr>${cellsHtml}</tr>`;
    })
    .join('');

  if (!rowsHtml) {
    return '';
  }

  return `<table style="border-collapse: collapse; width: 100%; margin: 0 0 16px 0; font-size: 14px;">${rowsHtml}</table>`;
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

    case 'checkListItem': {
      const checkbox = props.checked ? '&#9745;' : '&#9744;';

      return `<p style="margin: 0 0 12px 0;">${checkbox} ${renderInlineContent(
        block.content as EmailInlineContent[],
      )}</p>`;
    }

    case 'table':
      return renderTableBlock(block.content);

    case 'codeBlock': {
      const code = escapeHtml(getInlineText(block.content));

      return code
        ? `<pre style="margin: 0 0 16px 0; padding: 12px; background-color: #f4f4f4; border-radius: 6px; font-family: monospace; font-size: 13px; white-space: pre-wrap;">${code}</pre>`
        : '';
    }

    case 'quote':
      return `<blockquote style="margin: 0 0 16px 0; padding: 4px 16px; border-left: 3px solid #ddd; color: #555;">${renderInlineContent(
        block.content as EmailInlineContent[],
      )}</blockquote>`;

    case 'image':
      return renderImageBlock(props);

    case 'documentPlaceholder':
      return props.documentId ? `{{ document.${props.documentId} }}` : '';

    default:
      return renderInlineContent(block.content as EmailInlineContent[]);
  }
};

/**
 * Consecutive bullet/numbered list items are grouped into real <ul>/<ol>
 * wrappers, since bare <li> elements render inconsistently in email clients.
 */
const renderBlocks = (blocks: EmailBlock[]) => {
  const html: string[] = [];
  let listItems: string[] = [];
  let listTag: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listTag && listItems.length) {
      html.push(
        `<${listTag} style="margin: 0 0 16px 0; padding-left: 24px;">${listItems.join(
          '',
        )}</${listTag}>`,
      );
    }

    listItems = [];
    listTag = null;
  };

  for (const block of blocks) {
    const tag =
      block.type === 'bulletListItem'
        ? 'ul'
        : block.type === 'numberedListItem'
          ? 'ol'
          : null;

    if (tag) {
      if (listTag !== tag) {
        flushList();
        listTag = tag;
      }

      listItems.push(
        `<li style="margin: 0 0 4px 0;">${renderInlineContent(
          block.content as EmailInlineContent[],
        )}</li>`,
      );
      continue;
    }

    flushList();
    html.push(renderBlock(block));
  }

  flushList();

  return html.join('');
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

    return renderBlocks(blocks);
  } catch {
    return fallbackHtml || content;
  }
};

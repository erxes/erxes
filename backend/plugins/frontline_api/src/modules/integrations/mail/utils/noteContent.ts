/**
 * The ticket note composer stores BlockNote documents, so `note.content` is a
 * JSON array of blocks rather than prose. Mail needs HTML, and a note written
 * through the API may still be plain text or HTML, so anything that is not a
 * block array is passed through untouched.
 */

type TInlineStyles = Record<string, string | boolean | undefined>;

interface IInline {
  type?: string;
  text?: string;
  href?: string;
  styles?: TInlineStyles;
  props?: Record<string, string | undefined>;
  content?: IInline[];
}

interface IBlock {
  type?: string;
  props?: Record<string, string | number | boolean | undefined>;
  content?: IInline[] | string;
  children?: IBlock[];
}

const HEADING_LEVELS = new Set([1, 2, 3]);

const LIST_TAGS: Record<string, string> = {
  bulletListItem: 'ul',
  numberedListItem: 'ol',
  checkListItem: 'ul',
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const styleAttribute = (styles?: TInlineStyles) => {
  if (!styles) {
    return '';
  }

  const css: string[] = [];

  if (styles.bold) css.push('font-weight:bold');
  if (styles.italic) css.push('font-style:italic');
  if (styles.strike) css.push('text-decoration:line-through');
  if (styles.underline) css.push('text-decoration:underline');
  if (typeof styles.textColor === 'string' && styles.textColor !== 'default') {
    css.push(`color:${styles.textColor}`);
  }

  return css.length ? ` style="${css.join(';')}"` : '';
};

const renderInline = (content?: IInline[] | string): string => {
  if (typeof content === 'string') {
    return escapeHtml(content);
  }

  if (!Array.isArray(content)) {
    return '';
  }

  return content
    .map((item) => {
      if (item.type === 'link') {
        const href = escapeHtml(item.href ?? '#');

        return `<a href="${href}">${renderInline(item.content) || href}</a>`;
      }

      // A mention carries no text of its own; the reader still needs the name.
      if (item.type === 'mention') {
        return `<strong>@${escapeHtml(item.props?.fullName ?? '')}</strong>`;
      }

      const text = escapeHtml(item.text ?? '').replace(/\n/g, '<br />');

      if (!text) {
        return '';
      }

      if (item.styles?.code) {
        return `<code>${text}</code>`;
      }

      const style = styleAttribute(item.styles);

      return style ? `<span${style}>${text}</span>` : text;
    })
    .join('');
};

const renderBlock = (block: IBlock): string => {
  const inner = renderInline(block.content);
  const children = block.children?.length ? renderBlocks(block.children) : '';

  switch (block.type) {
    case 'heading': {
      const level = Number(block.props?.level ?? 1);
      const tag = HEADING_LEVELS.has(level) ? `h${level}` : 'h1';

      return `<${tag}>${inner}</${tag}>${children}`;
    }

    case 'bulletListItem':
    case 'numberedListItem':
    case 'checkListItem':
      return `<li>${inner}${children}</li>`;

    case 'quote':
      return `<blockquote>${inner}</blockquote>${children}`;

    case 'codeBlock':
      return `<pre><code>${inner}</code></pre>${children}`;

    case 'image': {
      const url = block.props?.url;

      if (typeof url !== 'string' || !url) {
        return children;
      }

      const caption = escapeHtml(String(block.props?.caption ?? ''));

      return `<p><img src="${escapeHtml(url)}" alt="${caption}" /></p>${children}`;
    }

    default:
      return inner || children ? `<p>${inner}</p>${children}` : '';
  }
};

const renderBlocks = (blocks: IBlock[]): string => {
  const html: string[] = [];
  let openList = '';

  const closeList = () => {
    if (openList) {
      html.push(`</${openList}>`);
      openList = '';
    }
  };

  for (const block of blocks) {
    const listTag = LIST_TAGS[block.type ?? ''];

    if (listTag !== openList) {
      closeList();

      if (listTag) {
        html.push(`<${listTag}>`);
        openList = listTag;
      }
    }

    html.push(renderBlock(block));
  }

  closeList();

  return html.join('');
};

const parseBlocks = (content: string): IBlock[] | null => {
  try {
    const parsed: unknown = JSON.parse(content);

    return Array.isArray(parsed) ? (parsed as IBlock[]) : null;
  } catch {
    return null;
  }
};

export const noteContentToHtml = (content?: string) => {
  const raw = (content ?? '').trim();

  if (!raw) {
    return '';
  }

  const blocks = parseBlocks(raw);

  return blocks ? renderBlocks(blocks) : raw;
};

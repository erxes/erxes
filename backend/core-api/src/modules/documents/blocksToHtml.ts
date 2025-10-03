type Style = Record<string, string | boolean>;
type BlockProps = Record<string, string | number | boolean>;
type Config = Record<string, string>;

type Block = {
  type: string;
  content?: Record<string, any>;
  children?: Record<string, any>;
  props?: BlockProps;
};

type Inline = {
  type: string;
  text: string;
  href?: string;
  styles?: Style;
  content?: Inline[];
};

export const COLORS_DEFAULT = {
  gray: {
    text: '#9b9a97',
    background: '#ebeced',
  },
  brown: {
    text: '#64473a',
    background: '#e9e5e3',
  },
  red: {
    text: '#e03e3e',
    background: '#fbe4e4',
  },
  orange: {
    text: '#d9730d',
    background: '#f6e9d9',
  },
  yellow: {
    text: '#dfab01',
    background: '#fbf3db',
  },
  green: {
    text: '#4d6461',
    background: '#ddedea',
  },
  blue: {
    text: '#0b6e99',
    background: '#ddebf1',
  },
  purple: {
    text: '#6940a5',
    background: '#eae4f2',
  },
  pink: {
    text: '#ad1a72',
    background: '#f4dfeb',
  },
};

const color = (color: string, type: 'text' | 'background', config?: Config) => {
  return COLORS_DEFAULT[color][type];
};

const inline = (block: Block): Inline[] => {
  const { content, children } = block;

  if (content?.length) {
    return content as Inline[];
  }

  if (children?.length) {
    return children as Inline[];
  }

  return [];
};

const STYLE_PROPS = {
  bold: 'font-weight',
  italic: 'font-style',
  underline: 'text-decoration',
  strike: 'text-decoration',
  textColor: 'color',
  backgroundColor: 'background-color',
};

const KEY_CORRECTION = {
  strike: 'line-through',
};

const getStyle = (source?: Record<string, any>, config?: Config) => {
  if (!source) return '';

  const styles: string[] = [];

  for (const key in source) {
    const value = source[key];
    if (!value) continue;

    switch (key) {
      case 'textColor':
        if (value !== 'default')
          styles.push(`color: ${color(value as string, 'text', config)}`);
        break;
      case 'backgroundColor':
        if (value !== 'default')
          styles.push(
            `background-color: ${color(value as string, 'background', config)}`,
          );
        break;
      case 'textAlignment':
        styles.push(`text-align: ${value}`);
        break;
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strike':
        styles.push(`${STYLE_PROPS[key]}: ${KEY_CORRECTION[key]}`);
        break;
      default:
        break;
    }
  }

  return styles.join('; ');
};

const renderInline = (inline: Inline, config?: Config) => {
  if (!inline) return '';

  const { text, styles, type, content } = inline;

  const style = getStyle(styles, config);

  if (style.length) {
    return `<span style="${style}">${text}</span>`;
  }

  if (type === 'link') {
    const children = (content || [])
      .map((child: Inline) => renderInline(child, config))
      .join('');
    return `<a href="${inline.href}" target="_blank" rel="noopener noreferrer">${children}</a>`;
  }

  return text?.replace(/\n/g, '<br />');
};

const renderParagraph = (block: Block, config?: Config) => {
  const inlines = inline(block);

  const content = inlines
    .map((inline) => renderInline(inline, config))
    .join('');

  return `<p style="${getStyle(block.props, config)}">${content}</p>`;
};

const renderHeading = (block: Block, config?: Config) => {
  const { level, isToggleable } = block.props || {};

  const inlines = inline(block);

  const content = inlines
    .map((inline) => renderInline(inline, config))
    .join('');

  if (isToggleable) {
    const nestedContent = (block.children || [])
      .map((inline) => renderBlock(inline, config))
      .join('\n');

    return `<div style="${getStyle(block.props, config)}">
    <details>
    <summary><h${level} style="${getStyle(
      block.props,
      config,
    )}; display: inline-block">${content}</h${level}></summary>
      <div style="margin-left:24px">
        ${nestedContent}
      </div>
    </details>
  </div>`;
  }

  return `<h${level} style="${getStyle(
    block.props,
    config,
  )}">${content}</h${level}>`;
};

const renderList = (block: Block, config?: Config) => {
  const { type } = block || {};

  const LIST_TAG = {
    bulletListItem: 'ul',
    numberedListItem: 'ol',
  };

  const inlines = inline(block);

  const content = inlines
    .map((inline) => `<li>${renderInline(inline, config)}</li>`)
    .join('');

  return `<${LIST_TAG[type]}>${content}</${LIST_TAG[type]}>`;
};

const renderToggleList = (block: Block, config?: Config) => {
  const { children = [] } = block || {};

  const inlines = inline(block);

  const content = inlines
    .map((inline) => renderInline(inline, config))
    .join('');

  const nestedContent = children
    .map((inline) => renderBlock(inline, config))
    .join('\n');

  return `<div style="${getStyle(block.props, config)}"><details>
    <summary>${content}</summary>
      <div style="margin-left:24px">
        ${nestedContent}
      </div>
    </details></div>`;
};

const renderCheckbox = (block: Block, config?: Config) => {
  const { props } = block || {};

  const { checked } = props || {};

  const inlines = inline(block);

  const content = inlines
    .map((inline) => renderInline(inline, config))
    .join('');

  return `<div style="${getStyle(
    block.props,
    config,
  )}" class="checkbox-group"><label><input type="checkbox" ${
    checked ? 'checked' : ''
  } /> ${content}</label></div>`;
};

const renderImage = (block: Block, config?: Config) => {
  const { props } = block || {};

  console.log('block', block);

  const { url, name, caption, previewWidth } = props || {};

  return `<div style="${getStyle(
    block.props,
    config,
  )}"><img src="${url}" alt="${name}" title="${caption}" width="${previewWidth}px" style="display:inline-block;"/></div>`;
};

const renderCode = (block: Block, config?: Config) => {
  const { props } = block || {};

  const { language } = props || {};

  const inlines = inline(block);

  const content = inlines
    .map((inline) => renderInline(inline, config))
    .join('');

  return `<div style="${getStyle(
    block.props,
    config,
  )}; padding: 24px;" class="code"><pre style="margin: 0;"><code class="language-${language}">${content}</code></pre></div>`;
};

const renderQuote = (block: Block, config?: Config) => {
  const inlines = inline(block);

  const content = inlines
    .map((inline) => renderInline(inline, config))
    .join('');

  return `<blockquote style="${getStyle(
    block.props,
    config,
  )}">${content}</blockquote>`;
};

const renderTable = (block: Block, config?: Config) => {
  const { content } = block || {};

  const colGroups = (content?.columnWidths || [])
    .map((columnWidth) => {
      return `<col width="${columnWidth}px" />`;
    })
    .join('');

  const rows = (content?.rows || [])
    .map((row) => {
      const cells = (row?.cells || [])
        .map((cell) => {
          const { props } = cell || {};

          const { colspan, rowspan } = props || {};

          const inlines = inline(cell);

          const content = inlines
            .map((inline) => renderInline(inline, config))
            .join('');

          return `<td style="${getStyle(
            cell.props,
            config,
          )}" colspan="${colspan}" rowspan="${rowspan}">${content}</td>`;
        })
        .join('');

      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `<table style="${getStyle(block.props, config)}">
    <colgroup>${colGroups}</colgroup>
    ${rows}
  </table>`;
};

const renderBlock = (block: Block, config?: Config) => {
  const { type } = block || {};

  switch (type) {
    case 'paragraph':
      return renderParagraph(block, config);
    case 'heading':
      return renderHeading(block, config);
    case 'bulletListItem':
    case 'numberedListItem':
      return renderList(block, config);
    case 'toggleListItem':
      return renderToggleList(block, config);
    case 'checkListItem':
      return renderCheckbox(block, config);
    case 'image':
      return renderImage(block, config);
    case 'codeBlock':
      return renderCode(block, config);
    case 'quote':
      return renderQuote(block, config);
    case 'table':
      return renderTable(block, config);
    default: {
      const inlines = inline(block);

      if (inlines && inlines.length) {
        return inlines.map((inline) => renderInline(inline, config)).join('');
      }

      return `<pre>${JSON.stringify(block)}</pre>`;
    }
  }
};

const renderBlocks = (blocks: Block[], config?: Config) => {
  const html: string[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    // Check if this block is a list item
    if (block.type === 'bulletListItem' || block.type === 'numberedListItem') {
      const listType = block.type === 'bulletListItem' ? 'ul' : 'ol';
      const items: string[] = [];

      while (i < blocks.length && blocks[i].type === block.type) {
        const inlines = inline(blocks[i]); // Inline[]
        const content = inlines
          .map((item) => renderInline(item, config))
          .join('');
        items.push(`<li>${content}</li>`);
        i++;
      }

      html.push(`<${listType}>${items.join('')}</${listType}>`);
      continue;
    }

    // Render normal block
    html.push(renderBlock(block, config));
    i++;
  }

  return html.join('\n');
};

export const blocksToHtml = (content: any, config?: Config) => {
  const blocks: Block[] = JSON.parse(content);

  if (!blocks) return '';

  return renderBlocks(blocks, config);
};

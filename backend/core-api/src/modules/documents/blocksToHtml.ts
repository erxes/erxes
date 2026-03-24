import type { Block, PartialBlock } from '@blocknote/core';

export const COLORS_DEFAULT = {
  gray: { text: '#9b9a97', background: '#ebeced' },
  brown: { text: '#64473a', background: '#e9e5e3' },
  red: { text: '#e03e3e', background: '#fbe4e4' },
  orange: { text: '#d9730d', background: '#f6e9d9' },
  yellow: { text: '#dfab01', background: '#fbf3db' },
  green: { text: '#4d6461', background: '#ddedea' },
  blue: { text: '#0b6e99', background: '#ddebf1' },
  purple: { text: '#6940a5', background: '#eae4f2' },
  pink: { text: '#ad1a72', background: '#f4dfeb' },
} as const;

type ColorName = keyof typeof COLORS_DEFAULT;
type ColorConfig = Record<string, { text: string; background: string }>;

interface Config {
  colors?: ColorConfig;
  baseFont?: string;
  baseFontSize?: string;
  baseLineHeight?: string;
  baseColor?: string;
  maxWidth?: number;
  wrapper?: {
    email?: boolean;
  };
}

const DEFAULTS = {
  baseFont:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  baseFontSize: '16px',
  baseLineHeight: '1.6',
  baseColor: '#000000',
  maxWidth: 600,
};

const getColor = (
  colorName: string,
  type: 'text' | 'background',
  config?: Config,
): string => {
  const colors = config?.colors || COLORS_DEFAULT;
  const color = colors[colorName]?.[type];

  if (!color) {
    console.warn(`Color not found: ${colorName}.${type}`);
    return type === 'text' ? '#000000' : 'transparent';
  }

  return color;
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const stylesToCss = (styles?: Record<string, any>, config?: Config): string => {
  if (!styles) return '';

  const cssProps: string[] = [];

  for (const [key, value] of Object.entries(styles)) {
    if (!value || value === 'default') continue;

    switch (key) {
      case 'bold':
        cssProps.push('font-weight: bold');
        break;
      case 'italic':
        cssProps.push('font-style: italic');
        break;
      case 'underline':
        cssProps.push('text-decoration: underline');
        break;
      case 'strikethrough':
      case 'strike':
        cssProps.push('text-decoration: line-through');
        break;
      case 'code':
        cssProps.push('font-family: Courier, monospace');
        cssProps.push('background-color: #f4f4f4');
        cssProps.push('padding: 2px 4px');
        cssProps.push('border-radius: 3px');
        cssProps.push('font-size: 90%');
        break;
      case 'textColor':
        if (value !== 'default') {
          cssProps.push(`color: ${getColor(value, 'text', config)}`);
        }
        break;
      case 'backgroundColor':
        if (value !== 'default') {
          cssProps.push(
            `background-color: ${getColor(value, 'background', config)}`,
          );
        }
        break;
      case 'textAlignment':
        cssProps.push(`text-align: ${value}`);
        break;
    }
  }

  return cssProps.join('; ');
};

const renderInlineContent = (content: any[], config?: Config): string => {
  if (!Array.isArray(content) || content.length === 0) return '';

  return content
    .map((item) => {
      const { type, text, styles, href, content: nestedContent } = item;

      // Handle links - email-safe with full inline styles
      if (type === 'link') {
        const children = renderInlineContent(nestedContent || [], config);
        const linkStyles = 'color: #0066cc; text-decoration: underline';
        return `<a href="${escapeHtml(
          href || '#',
        )}" style="${linkStyles}">${children}</a>`;
      }

      const escapedText = escapeHtml(text || '').replace(/\n/g, '<br />');
      const cssStyle = stylesToCss(styles, config);

      if (cssStyle) {
        return `<span style="${cssStyle}">${escapedText}</span>`;
      }

      return escapedText;
    })
    .join('');
};

const getBaseStyles = (config?: Config) => {
  return {
    p: `margin: 0 0 16px 0; font-family: ${
      config?.baseFont || DEFAULTS.baseFont
    }; font-size: ${
      config?.baseFontSize || DEFAULTS.baseFontSize
    }; line-height: ${
      config?.baseLineHeight || DEFAULTS.baseLineHeight
    }; color: ${config?.baseColor || DEFAULTS.baseColor}`,
    h1: `margin: 24px 0 16px 0; font-family: ${
      config?.baseFont || DEFAULTS.baseFont
    }; font-size: 32px; font-weight: bold; line-height: 1.2; color: ${
      config?.baseColor || DEFAULTS.baseColor
    }`,
    h2: `margin: 20px 0 12px 0; font-family: ${
      config?.baseFont || DEFAULTS.baseFont
    }; font-size: 24px; font-weight: bold; line-height: 1.3; color: ${
      config?.baseColor || DEFAULTS.baseColor
    }`,
    h3: `margin: 16px 0 8px 0; font-family: ${
      config?.baseFont || DEFAULTS.baseFont
    }; font-size: 20px; font-weight: bold; line-height: 1.4; color: ${
      config?.baseColor || DEFAULTS.baseColor
    }`,
    ul: `margin: 0 0 16px 0; padding: 0 0 0 24px; font-family: ${
      config?.baseFont || DEFAULTS.baseFont
    }`,
    ol: `margin: 0 0 16px 0; padding: 0 0 0 24px; font-family: ${
      config?.baseFont || DEFAULTS.baseFont
    }`,
    li: `margin: 0 0 8px 0; font-size: ${
      config?.baseFontSize || DEFAULTS.baseFontSize
    }; line-height: ${config?.baseLineHeight || DEFAULTS.baseLineHeight}`,
    blockquote: `margin: 16px 0; padding: 8px 16px; border-left: 4px solid #ddd; background-color: #f9f9f9; font-family: ${
      config?.baseFont || DEFAULTS.baseFont
    }; font-style: italic`,
    table: `border-collapse: collapse; width: 100%; margin: 16px 0; font-family: ${
      config?.baseFont || DEFAULTS.baseFont
    }`,
    pre: `margin: 16px 0; padding: 16px; background-color: #f4f4f4; border: 1px solid #ddd; border-radius: 4px; overflow-x: auto; font-family: Courier, monospace; font-size: 14px; line-height: 1.5`,
  };
};

const mergeStyles = (baseStyle: string, customStyle?: string): string => {
  if (!customStyle) return baseStyle;
  return `${baseStyle}; ${customStyle}`;
};

const renderBlock = (block: Block | PartialBlock, config?: Config): string => {
  const { type, props, content, children } = block as any;
  const baseStyles = getBaseStyles(config);
  const customStyle = stylesToCss(props, config);

  switch (type) {
    case 'paragraph': {
      const html = renderInlineContent(content || [], config);
      if (!html.trim()) return '<p style="' + baseStyles.p + '">&nbsp;</p>';
      return `<p style="${mergeStyles(baseStyles.p, customStyle)}">${html}</p>`;
    }

    case 'heading': {
      const level = Math.min(Math.max(props?.level || 1, 1), 3);
      const html = renderInlineContent(content || [], config);
      const headingStyle = baseStyles[`h${level}` as 'h1' | 'h2' | 'h3'];
      return `<h${level} style="${mergeStyles(
        headingStyle,
        customStyle,
      )}">${html}</h${level}>`;
    }

    case 'bulletListItem': {
      const html = renderInlineContent(content || [], config);
      return `<li style="${mergeStyles(
        baseStyles.li,
        customStyle,
      )}">${html}</li>`;
    }

    case 'numberedListItem': {
      const html = renderInlineContent(content || [], config);
      return `<li style="${mergeStyles(
        baseStyles.li,
        customStyle,
      )}">${html}</li>`;
    }

    case 'checkListItem': {
      const html = renderInlineContent(content || [], config);
      const checked = props?.checked;
      const checkbox = checked ? '☑' : '☐';
      return `<div style="${mergeStyles(
        baseStyles.p,
        customStyle,
      )}">${checkbox} ${html}</div>`;
    }

    case 'codeBlock': {
      const code =
        content?.map((c: any) => escapeHtml(c.text || '')).join('\n') || '';
      return `<pre style="${mergeStyles(
        baseStyles.pre,
        customStyle,
      )}"><code>${code}</code></pre>`;
    }

    case 'image': {
      const { url, caption, name, previewWidth } = props || {};
      const width = Math.min(previewWidth, 600);
      const imgStyle = `max-width: 100%; height: auto; display: block; margin: 0`;

      let html = `<div style="margin: 16px 0;">
        <img src="${escapeHtml(url || '')}" alt="${escapeHtml(
        name || '',
      )}" width="${width}" style="${imgStyle}" />`;

      if (caption) {
        html += `<div style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">${escapeHtml(
          caption,
        )}</div>`;
      }

      html += `</div>`;
      return html;
    }

    case 'table': {
      const { rows } = content || {};
      if (!rows || !Array.isArray(rows)) return '';

      const tableRows = rows
        .map((row: any, rowIndex: number) => {
          const cells = (row.cells || [])
            .map((cell: any) => {
              const cellContent = renderInlineContent(
                cell.content || [],
                config,
              );
              const cellStyle = `padding: 8px; border: 1px solid #ddd; ${
                rowIndex === 0
                  ? 'font-weight: bold; background-color: #f4f4f4;'
                  : ''
              }`;
              return `<td style="${cellStyle}">${cellContent || '&nbsp;'}</td>`;
            })
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');

      return `<table style="${mergeStyles(baseStyles.table, customStyle)}">
        <tbody>${tableRows}</tbody>
      </table>`;
    }

    case 'quote': {
      const html = renderInlineContent(content || [], config);
      return `<blockquote style="${mergeStyles(
        baseStyles.blockquote,
        customStyle,
      )}">${html}</blockquote>`;
    }

    default: {
      const html = renderInlineContent(content || [], config);
      return html ? `<p style="${baseStyles.p}">${html}</p>` : '';
    }
  }
};

const groupListBlocks = (
  blocks: (Block | PartialBlock)[],
  config?: Config,
): string => {
  const result: string[] = [];
  const baseStyles = getBaseStyles(config);
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i] as any;

    if (block.type === 'bulletListItem') {
      const items: string[] = [];
      while (
        i < blocks.length &&
        (blocks[i] as any).type === 'bulletListItem'
      ) {
        items.push(renderBlock(blocks[i], config));
        i++;
      }
      result.push(`<ul style="${baseStyles.ul}">${items.join('')}</ul>`);
      continue;
    }

    if (block.type === 'numberedListItem') {
      const items: string[] = [];
      while (
        i < blocks.length &&
        (blocks[i] as any).type === 'numberedListItem'
      ) {
        items.push(renderBlock(blocks[i], config));
        i++;
      }
      result.push(`<ol style="${baseStyles.ol}">${items.join('')}</ol>`);
      continue;
    }

    result.push(renderBlock(block, config));
    i++;
  }

  return result.join('\n');
};

export const blocksToHtml = (
  blocks: Block[] | PartialBlock[] | string,
  config?: Config,
): string => {
  const { wrapper } = config || {};

  try {
    const parsedBlocks =
      typeof blocks === 'string' ? JSON.parse(blocks) : blocks;

    if (!Array.isArray(parsedBlocks) || parsedBlocks.length === 0) {
      return '';
    }

    if (wrapper?.email) {
      return emailHtmlWrapper(groupListBlocks(parsedBlocks, config), config);
    }

    return groupListBlocks(parsedBlocks, config);
  } catch (error) {
    console.error('Error converting blocks to HTML:', error);
    return '';
  }
};

export const emailHtmlWrapper = (html: string, config?: Config) => {
  const maxWidth = Math.min(config?.maxWidth || DEFAULTS.maxWidth, 600);

  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table border="0" cellpadding="0" cellspacing="0" width="${maxWidth}" style="background-color: #ffffff;">
                <tr>
                  <td style="padding: 20px;">
                    ${html}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

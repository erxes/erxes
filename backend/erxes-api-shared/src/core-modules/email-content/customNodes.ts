import { JSONContent } from './types';

/**
 * Nodes the email editor understands but `@maily-to/render` does not. They are
 * turned into its custom-html node before rendering, which it emits verbatim —
 * so a block can be added here without forking the renderer.
 */
const HTML_NODE = 'htmlCodeBlock';

type TPart = JSONContent;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const CELL_STYLE =
  'border: 1px solid #e5e7eb; padding: 8px 12px; vertical-align: top; font-size: 15px; line-height: 1.6; color: #374151;';

const HEADER_STYLE = `${CELL_STYLE} background-color: #f9fafb; font-weight: 600; color: #111827; text-align: left;`;

const TABLE_STYLE =
  'border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #e5e7eb;';

const markUp = (html: string, marks?: JSONContent['marks']) =>
  (marks || []).reduce((wrapped, mark) => {
    const { type, attrs } = mark as { type?: string; attrs?: Record<string, any> };

    switch (type) {
      case 'bold':
        return `<strong>${wrapped}</strong>`;
      case 'italic':
        return `<em>${wrapped}</em>`;
      case 'underline':
        return `<u>${wrapped}</u>`;
      case 'strike':
        return `<s>${wrapped}</s>`;
      case 'link':
        return `<a href="${escapeHtml(
          String(attrs?.href || ''),
        )}" target="_blank" rel="noopener" style="color: #2563eb; text-decoration: underline;">${wrapped}</a>`;
      case 'textStyle':
        return attrs?.color
          ? `<span style="color: ${escapeHtml(String(attrs.color))};">${wrapped}</span>`
          : wrapped;
      default:
        return wrapped;
    }
  }, html);

/**
 * Inline content becomes a run of parts rather than one string: a variable has
 * to stay a node so the renderer still fills it in with the recipient's value.
 */
const pushInline = (parts: TPart[], nodes: JSONContent[] = []) => {
  for (const node of nodes) {
    if (node.type === 'variable') {
      parts.push(node);
      continue;
    }

    if (node.type === 'hardBreak') {
      parts.push({ type: 'text', text: '<br />' });
      continue;
    }

    if (node.text) {
      parts.push({ type: 'text', text: markUp(escapeHtml(node.text), node.marks) });
    }
  }
};

const pushCellContent = (parts: TPart[], blocks: JSONContent[] = []) => {
  blocks.forEach((block, index) => {
    if (index) {
      parts.push({ type: 'text', text: '<br />' });
    }

    pushInline(parts, block.content);
  });
};

const pushTable = (parts: TPart[], table: JSONContent) => {
  parts.push({
    type: 'text',
    text: `<table role="presentation" cellpadding="0" cellspacing="0" style="${TABLE_STYLE}"><tbody>`,
  });

  for (const row of table.content || []) {
    parts.push({ type: 'text', text: '<tr>' });

    for (const cell of row.content || []) {
      const isHeader = cell.type === 'tableHeader';
      const { colspan = 1, rowspan = 1, colwidth } = (cell.attrs ||
        {}) as Record<string, any>;
      const width = Array.isArray(colwidth) && colwidth[0] ? colwidth[0] : null;

      parts.push({
        type: 'text',
        text: `<${isHeader ? 'th' : 'td'}${colspan > 1 ? ` colspan="${colspan}"` : ''}${
          rowspan > 1 ? ` rowspan="${rowspan}"` : ''
        } style="${isHeader ? HEADER_STYLE : CELL_STYLE}${
          width ? ` width: ${width}px;` : ''
        }">`,
      });

      pushCellContent(parts, cell.content);

      parts.push({ type: 'text', text: `</${isHeader ? 'th' : 'td'}>` });
    }

    parts.push({ type: 'text', text: '</tr>' });
  }

  parts.push({ type: 'text', text: '</tbody></table>' });
};

/** The fields a product card reads off each item of the list it repeats. */
export const PRODUCT_CARD_FIELDS = {
  NAME: 'name',
  IMAGE: 'imageUrl',
  DESCRIPTION: 'description',
  QUANTITY: 'quantity',
  UNIT_PRICE: 'unitPrice',
  AMOUNT: 'amount',
} as const;

const variable = (id: string): TPart => ({
  type: 'variable',
  attrs: { id, fallback: null, required: false },
});

const CARD_STYLE =
  'border-collapse: collapse; width: 100%; margin: 8px 0; border: 1px solid #e5e7eb; border-radius: 8px;';

const pushProductCard = (parts: TPart[], node: JSONContent) => {
  const {
    showImage = true,
    showDescription = true,
    showQuantity = true,
    showPrice = true,
  } = (node.attrs || {}) as Record<string, boolean>;

  parts.push({
    type: 'text',
    text: `<table role="presentation" cellpadding="0" cellspacing="0" style="${CARD_STYLE}"><tbody><tr>`,
  });

  if (showImage) {
    // A row of the list, drawn as a table: the only layout an email client
    // can be trusted with.
    parts.push({
      type: 'text',
      text: '<td width="96" style="padding: 12px; vertical-align: top;"><img width="72" height="72" style="display: block; border-radius: 6px; object-fit: cover;" src="',
    });
    parts.push(variable(PRODUCT_CARD_FIELDS.IMAGE));
    parts.push({ type: 'text', text: '" alt="" /></td>' });
  }

  parts.push({
    type: 'text',
    text: '<td style="padding: 12px; vertical-align: top; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif;"><div style="font-size: 15px; font-weight: 600; color: #111827;">',
  });
  parts.push(variable(PRODUCT_CARD_FIELDS.NAME));
  parts.push({ type: 'text', text: '</div>' });

  if (showDescription) {
    parts.push({
      type: 'text',
      text: '<div style="margin-top: 4px; font-size: 13px; line-height: 1.5; color: #6b7280;">',
    });
    parts.push(variable(PRODUCT_CARD_FIELDS.DESCRIPTION));
    parts.push({ type: 'text', text: '</div>' });
  }

  if (showQuantity) {
    parts.push({
      type: 'text',
      text: '<div style="margin-top: 6px; font-size: 13px; color: #6b7280;">× ',
    });
    parts.push(variable(PRODUCT_CARD_FIELDS.QUANTITY));
    parts.push({ type: 'text', text: '</div>' });
  }

  parts.push({ type: 'text', text: '</td>' });

  if (showPrice) {
    parts.push({
      type: 'text',
      text: '<td align="right" style="padding: 12px; vertical-align: top; white-space: nowrap; font-size: 15px; font-weight: 600; color: #111827;">',
    });
    parts.push(variable(PRODUCT_CARD_FIELDS.AMOUNT));
    parts.push({ type: 'text', text: '</td>' });
  }

  parts.push({ type: 'text', text: '</tr></tbody></table>' });
};

const EXPANDERS: Record<string, (parts: TPart[], node: JSONContent) => void> = {
  table: pushTable,
  productCard: pushProductCard,
};

export const expandCustomNodes = (node: JSONContent): JSONContent => {
  const expander = node.type ? EXPANDERS[node.type] : undefined;

  if (expander) {
    const parts: TPart[] = [];

    expander(parts, node);

    return {
      type: HTML_NODE,
      attrs: { language: 'html', showIfKey: node.attrs?.showIfKey ?? null },
      content: parts,
    };
  }

  if (!node.content?.length) {
    return node;
  }

  return { ...node, content: node.content.map(expandCustomNodes) };
};

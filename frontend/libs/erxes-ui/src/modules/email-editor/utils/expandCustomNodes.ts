import type { JSONContent } from '@tiptap/core';

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

const HEADER_STYLE = `${CELL_STYLE} font-weight: 600; color: #111827; text-align: left;`;

/** What a header cell wears when nobody picked anything for it. */
const HEADER_BACKGROUND = '#f9fafb';

const TABLE_STYLE =
  'border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #e5e7eb;';

const markUp = (html: string, marks?: JSONContent['marks']) =>
  (marks || []).reduce((wrapped, mark) => {
    const { type, attrs } = mark as {
      type?: string;
      attrs?: Record<string, unknown>;
    };

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
      const {
        colspan = 1,
        rowspan = 1,
        colwidth,
        backgroundColor,
      } = (cell.attrs || {}) as {
        colspan?: number;
        rowspan?: number;
        colwidth?: number[] | null;
        backgroundColor?: string | null;
      };
      const width = Array.isArray(colwidth) && colwidth[0] ? colwidth[0] : null;
      // A table written before backgrounds carries no attribute at all, and
      // its header still has to look like a header.
      const background =
        backgroundColor === undefined && isHeader
          ? HEADER_BACKGROUND
          : backgroundColor;

      parts.push({
        type: 'text',
        text: `<${isHeader ? 'th' : 'td'}${colspan > 1 ? ` colspan="${colspan}"` : ''}${
          rowspan > 1 ? ` rowspan="${rowspan}"` : ''
        } style="${isHeader ? HEADER_STYLE : CELL_STYLE}${
          width ? ` width: ${width}px;` : ''
        }${
          background
            ? ` background-color: ${escapeHtml(String(background))};`
            : ''
        }">`,
      });

      pushCellContent(parts, cell.content);

      parts.push({ type: 'text', text: `</${isHeader ? 'th' : 'td'}>` });
    }

    parts.push({ type: 'text', text: '</tr>' });
  }

  parts.push({ type: 'text', text: '</tbody></table>' });
};

/**
 * The document is not rendered here: it is produced per recipient, so the node
 * leaves behind the same `{{ document.<id> }}` marker the block editor emits
 * and the send path fills it in.
 */
const pushDocumentPlaceholder = (parts: TPart[], node: JSONContent) => {
  const documentId = String(node.attrs?.documentId || '');

  if (!documentId) {
    return;
  }

  parts.push({
    type: 'text',
    text: `<div class="erxes-document-placeholder" data-document-id="${escapeHtml(
      documentId,
    )}">{{ document.${escapeHtml(documentId)} }}</div>`,
  });
};

const EXPANDERS: Record<string, (parts: TPart[], node: JSONContent) => void> = {
  table: pushTable,
  documentPlaceholder: pushDocumentPlaceholder,
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

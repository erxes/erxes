import { mergeAttributes, Node } from '@tiptap/core';

export interface EmailDocumentPlaceholderAttrs {
  documentId: string;
  documentName?: string;
  documentCode?: string;
  documentPreview?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    emailDocumentPlaceholder: {
      insertDocumentPlaceholder: (
        attrs: EmailDocumentPlaceholderAttrs,
      ) => ReturnType;
    };
  }
}

const dataAttribute = (key: string, attribute: string) => ({
  parseHTML: (element: HTMLElement) => element.getAttribute(attribute) || '',
  renderHTML: (attrs: Record<string, unknown>) => ({
    [attribute]: attrs[key] || '',
  }),
});

const CARD_STYLE =
  'margin: 8px 0; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb;';

/**
 * A document rendered into the email at send time. The node holds only which
 * document it is: the body is produced per recipient, so the editor shows the
 * document's name and a teaser of it rather than its content.
 */
export const EmailDocumentPlaceholder = Node.create({
  name: 'documentPlaceholder',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes: () => ({
    documentId: {
      default: '',
      ...dataAttribute('documentId', 'data-document-id'),
    },
    documentName: {
      default: 'Untitled document',
      ...dataAttribute('documentName', 'data-document-name'),
    },
    documentCode: {
      default: '',
      ...dataAttribute('documentCode', 'data-document-code'),
    },
    documentPreview: {
      default: '',
      ...dataAttribute('documentPreview', 'data-document-preview'),
    },
  }),

  parseHTML: () => [{ tag: 'div[data-document-placeholder]' }],

  renderHTML({ HTMLAttributes, node }) {
    const { documentName, documentCode, documentPreview } = node.attrs;

    const label = documentCode
      ? `Document · ${documentCode}`
      : 'Rendered when the email is sent';

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-document-placeholder': '',
        style: CARD_STYLE,
      }),
      [
        'div',
        { style: 'font-size: 14px; font-weight: 600; color: #111827;' },
        documentName || 'Untitled document',
      ],
      [
        'div',
        { style: 'margin-top: 2px; font-size: 12px; color: #6b7280;' },
        label,
      ],
      ...(documentPreview
        ? [
            [
              'div',
              {
                style:
                  'margin-top: 6px; font-size: 12px; line-height: 1.5; color: #6b7280;',
              },
              documentPreview,
            ],
          ]
        : []),
    ];
  },

  addCommands() {
    return {
      insertDocumentPlaceholder:
        (attrs) =>
        ({ chain }) =>
          chain()
            .insertContent([
              { type: this.name, attrs },
              { type: 'paragraph' },
            ])
            .run(),
    };
  },
});

import { mergeAttributes, Node } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    emailProductCard: {
      insertProductCard: () => ReturnType;
      toggleProductCardField: (
        field: 'showImage' | 'showDescription' | 'showQuantity' | 'showPrice',
      ) => ReturnType;
    };
  }
}

const FIELD_LABEL = {
  name: 'Product name',
  description: 'Description',
  quantity: 'Qty',
  amount: 'Amount',
};

const cellStyle = 'padding: 12px; vertical-align: top;';

/**
 * One row of a repeated list, drawn as a card. It carries no text of its own:
 * every value comes from the item the repeat is walking, which is why the
 * editor shows field names rather than content.
 */
export const EmailProductCard = Node.create({
  name: 'productCard',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes: () => ({
    showImage: { default: true },
    showDescription: { default: true },
    showQuantity: { default: true },
    showPrice: { default: true },
  }),

  parseHTML: () => [{ tag: 'table[data-product-card]' }],

  renderHTML({ HTMLAttributes, node }) {
    const { showImage, showDescription, showQuantity, showPrice } = node.attrs;

    const text = (
      label: string,
      style: string,
    ): [string, Record<string, string>, string] => ['div', { style }, label];

    const details: unknown[] = [
      'td',
      { style: cellStyle },
      text('Product name', 'font-size: 15px; font-weight: 600; color: #111827;'),
    ];

    if (showDescription) {
      details.push(
        text(
          FIELD_LABEL.description,
          'margin-top: 4px; font-size: 13px; color: #6b7280;',
        ),
      );
    }

    if (showQuantity) {
      details.push(
        text(
          `× ${FIELD_LABEL.quantity}`,
          'margin-top: 6px; font-size: 13px; color: #6b7280;',
        ),
      );
    }

    return [
      'table',
      mergeAttributes(HTMLAttributes, {
        'data-product-card': '',
        style:
          'border-collapse: collapse; width: 100%; margin: 8px 0; border: 1px solid #e5e7eb; border-radius: 8px;',
      }),
      [
        'tbody',
        [
          'tr',
          ...(showImage
            ? [
                [
                  'td',
                  { width: '96', style: cellStyle },
                  [
                    'div',
                    {
                      style:
                        'width: 72px; height: 72px; border-radius: 6px; background: #f3f4f6; color: #9ca3af; font-size: 11px; display: flex; align-items: center; justify-content: center;',
                    },
                    'Image',
                  ],
                ],
              ]
            : []),
          details,
          ...(showPrice
            ? [
                [
                  'td',
                  {
                    align: 'right',
                    style: `${cellStyle} white-space: nowrap; font-size: 15px; font-weight: 600; color: #111827;`,
                  },
                  FIELD_LABEL.amount,
                ],
              ]
            : []),
        ],
      ],
    ];
  },

  addCommands() {
    return {
      insertProductCard:
        () =>
        ({ chain }) =>
          chain().insertContent({ type: this.name }).run(),
      toggleProductCardField:
        (field) =>
        ({ state, chain }) => {
          const { from } = state.selection;
          const node = state.doc.nodeAt(from);

          if (node?.type.name !== this.name) {
            return false;
          }

          return chain()
            .updateAttributes(this.name, { [field]: !node.attrs[field] })
            .run();
        },
    };
  },
});

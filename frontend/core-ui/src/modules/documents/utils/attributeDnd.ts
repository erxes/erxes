import { IBlockEditor } from 'erxes-ui';

export const ATTRIBUTE_DND_MIME = 'application/x-erxes-attribute';

export interface DraggableAttribute {
  label?: string;
  name: string;
  value?: any;
}

const buildAttributeInlineContent = (attribute: DraggableAttribute) => [
  {
    type: 'attribute' as const,
    props: {
      name: attribute.label || attribute.name,
      value: attribute.value || attribute.name,
    },
  },
  ' ',
];

export const insertAttribute = (
  editor: IBlockEditor,
  attribute: DraggableAttribute,
) => {
  editor.focus();
  editor.insertInlineContent(buildAttributeInlineContent(attribute));
};

let lastDropAt = 0;

export const insertAttributeAtPoint = (
  editor: IBlockEditor,
  attribute: DraggableAttribute,
  x: number,
  y: number,
) => {
  const now = Date.now();

  if (now - lastDropAt < 300) {
    return;
  }

  lastDropAt = now;

  const target = document.elementFromPoint(x, y);
  const blockEl = target?.closest('[data-id]');
  const blockId = blockEl?.getAttribute('data-id');

  editor.focus();

  if (blockId && editor.getBlock(blockId)) {
    editor.setTextCursorPosition(blockId, 'end');
  }

  editor.insertInlineContent(buildAttributeInlineContent(attribute));
};

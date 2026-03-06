import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  createStyleSpec,
} from '@blocknote/core';
import { Attribute, Mention } from '../components/BlockEditor';

export const fontFamily = createStyleSpec(
  {
    type: 'fontFamily',
    propSchema: 'string',
  },
  {
    render: (value) => {
      const span = document.createElement('span');
      span.style.fontFamily = value;
      return {
        dom: span,
      };
    },
  },
);

export const BLOCK_SCHEMA = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: Mention,
    attribute: Attribute,
  },
  styleSpecs: {
    ...defaultStyleSpecs,
    fontFamily,
  },
});

export const TABLE_SCHEMA = {
  splitCells: true,
  cellBackgroundColor: true,
  cellTextColor: true,
  headers: true,
};

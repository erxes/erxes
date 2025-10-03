import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from '@blocknote/core';
import { Attribute, Mention } from '../components/BlockEditor';

export const BLOCK_SCHEMA = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: Mention,
    attribute: Attribute,
  },
});

export const TABLE_SCHEMA = {
  splitCells: true,
  cellBackgroundColor: true,
  cellTextColor: true,
  headers: true,
};

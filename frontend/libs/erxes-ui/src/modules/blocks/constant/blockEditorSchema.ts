import {
  BlockNoteSchema,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
  defaultStyleSpecs,
  createStyleSpec,
} from '@blocknote/core';
import {
  Attribute,
  Mention,
} from 'erxes-ui/modules/blocks/components/BlockEditor';
import { customFileBlock } from 'erxes-ui/modules/blocks/components/CustomFileBlock';
import { customImageBlock } from 'erxes-ui/modules/blocks/components/CustomImageBlock';
import { documentPlaceholderBlock } from 'erxes-ui/modules/blocks/components/DocumentPlaceholderBlock';
import { galleryBlock } from 'erxes-ui/modules/blocks/components/GalleryBlock';
import { customVideoBlock } from 'erxes-ui/modules/blocks/components/CustomVideoBlock';

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
    image: customImageBlock,
    video: customVideoBlock,
    file: customFileBlock,
    gallery: galleryBlock,
    documentPlaceholder: documentPlaceholderBlock,
  },
  inlineContentSpecs: {
    ...defaultInlineContentSpecs,
    mention: Mention,
    attribute: Attribute,
  },
  styleSpecs: {
    ...defaultStyleSpecs,
    code: {
      ...defaultStyleSpecs.code,
      implementation: {
        ...defaultStyleSpecs.code.implementation,
        // Keep formatting saved underneath code so toggling it off restores it.
        mark: defaultStyleSpecs.code.implementation.mark
          .extend({
            excludes: '',
            priority: 1000,
          })
          .configure({
            HTMLAttributes: {
              class: [
                'font-mono! font-normal! not-italic! no-underline!',
                'text-(--color-foreground)! bg-(--color-muted)!',
                '[&_*]:font-mono! [&_*]:font-normal!',
                '[&_*]:not-italic! [&_*]:no-underline!',
                '[&_*]:text-inherit! [&_*]:bg-transparent!',
              ].join(' '),
            },
          }),
      },
    },
    fontFamily,
  },
});

export const TABLE_SCHEMA = {
  splitCells: true,
  cellBackgroundColor: true,
  cellTextColor: true,
  headers: true,
};

import {
  BlockNoteSchema,
  createHeadingBlockSpec,
  defaultBlockSpecs,
  defaultInlineContentSpecs,
} from '@blocknote/core';
import { createReactInlineContentSpec } from '@blocknote/react';
import { useTranslation } from 'react-i18next';
import { fieldToken } from './fields';

const FieldChip = ({ name, fallback }: { name: string; fallback: string }) => {
  const { t } = useTranslation('broadcasts');
  const label = t(`placeholder.${name}`, name);

  return (
    <span
      className="inline-flex items-center rounded bg-primary/10 px-1 font-medium text-primary-text"
      title={fallback ? t('field-fallback', 'Else “{{fallback}}”', { fallback }) : undefined}
    >
      {label}
    </span>
  );
};

/** A customer's value, filled at send; stored as `{{ name | fallback }}`. */
const field = createReactInlineContentSpec(
  {
    type: 'field',
    propSchema: { name: { default: '' }, fallback: { default: '' } },
    content: 'none',
  },
  {
    parse: (element) =>
      element.dataset.field
        ? { name: element.dataset.field, fallback: element.dataset.fallback ?? '' }
        : undefined,
    render: ({ inlineContent }) => <FieldChip {...inlineContent.props} />,
    toExternalHTML: ({ inlineContent }) => (
      <span>{fieldToken(inlineContent.props.name, inlineContent.props.fallback)}</span>
    ),
  },
);

const { paragraph, quote, bulletListItem, numberedListItem, divider, image } = defaultBlockSpecs;

/**
 * Only what a broadcast's Markdown keeps: text styles, alignment, colours and
 * tables would be lost when saved, so the editor doesn't offer them.
 */
export const BODY_SCHEMA = BlockNoteSchema.create({
  blockSpecs: {
    paragraph,
    heading: createHeadingBlockSpec({ levels: [1, 2, 3], allowToggleHeadings: false }),
    quote,
    bulletListItem,
    numberedListItem,
    divider,
    image,
  },
  inlineContentSpecs: { ...defaultInlineContentSpecs, field },
});

export type BodyEditor = typeof BODY_SCHEMA.BlockNoteEditor;

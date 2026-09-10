import type { EditorProps as MailyEditorProps } from '@maily-to/core';
import {
  blockquote,
  bulletList,
  button,
  clearLine,
  columns,
  divider,
  footer,
  hardBreak,
  heading1,
  heading2,
  heading3,
  htmlCodeBlock,
  image,
  inlineImage,
  linkCard,
  logo,
  orderedList,
  repeat,
  section,
  spacer,
  text,
} from '@maily-to/core/blocks';

type BlockGroups = NonNullable<MailyEditorProps['blocks']>;

export const DEFAULT_EMAIL_BLOCKS: BlockGroups = [
  {
    title: 'Basic',
    commands: [
      text,
      heading1,
      heading2,
      heading3,
      bulletList,
      orderedList,
      blockquote,
      divider,
      hardBreak,
      clearLine,
    ],
  },
  {
    title: 'Design',
    commands: [
      button,
      image,
      inlineImage,
      logo,
      columns,
      section,
      repeat,
      spacer,
      footer,
      linkCard,
    ],
  },
  {
    title: 'Advanced',
    commands: [htmlCodeBlock],
  },
];

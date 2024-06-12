import React from 'react';
import {
  TypeBold,
  TypeH1,
  TypeH2,
  TypeH3,
  TypeItalic,
  TypeUnderline,
  TypeStrikethrough,
  ListOl,
  ListUl,
  TextLeft,
  TextRight,
  TextCenter,
  Justify,
  Hr,
  Quote,
} from 'react-bootstrap-icons';

import { createControl } from './RichTextEditorControl';
import Icon from '../../Icon';

export const BoldControl = createControl({
  label: 'boldControlLabel',
  icon: () => <TypeBold />,
  isActive: { name: 'bold' },
  operation: { name: 'toggleBold' },
});

export const ItalicControl = createControl({
  label: 'italicControlLabel',
  icon: () => <TypeItalic />,
  isActive: { name: 'italic' },
  operation: { name: 'toggleItalic' },
});

export const UnderlineControl = createControl({
  label: 'underlineControlLabel',
  icon: () => <TypeUnderline />,
  isActive: { name: 'underline' },
  operation: { name: 'toggleUnderline' },
});

export const StrikeThroughControl = createControl({
  label: 'strikeControlLabel',
  icon: () => <TypeStrikethrough />,
  isActive: { name: 'strike' },
  operation: { name: 'toggleStrike' },
});

export const UnlinkControl = createControl({
  label: 'unlinkControlLabel',
  icon: () => <Icon icon="link-broken" />,
  operation: { name: 'unsetLink' },
});

export const BulletListControl = createControl({
  label: 'bulletListControlLabel',
  icon: () => <ListUl />,
  isActive: { name: 'bulletList' },
  operation: { name: 'toggleBulletList' },
});

export const OrderedListControl = createControl({
  label: 'orderedListControlLabel',
  icon: () => <ListOl />,
  isActive: { name: 'orderedList' },
  operation: { name: 'toggleOrderedList' },
});

export const BlockquoteControl = createControl({
  label: 'blockquoteControlLabel',
  icon: () => <Quote />,
  isActive: { name: 'blockquote' },
  operation: { name: 'toggleBlockquote' },
});

export const H1Control = createControl({
  label: 'h1ControlLabel',
  icon: () => <TypeH1 />,
  isActive: { name: 'heading', attributes: { level: 1 } },
  operation: { name: 'toggleHeading', attributes: { level: 1 } },
});

export const H2Control = createControl({
  label: 'h2ControlLabel',
  icon: () => <TypeH2 />,
  isActive: { name: 'heading', attributes: { level: 2 } },
  operation: { name: 'toggleHeading', attributes: { level: 2 } },
});

export const H3Control = createControl({
  label: 'h3ControlLabel',
  icon: () => <TypeH3 />,
  isActive: { name: 'heading', attributes: { level: 3 } },
  operation: { name: 'toggleHeading', attributes: { level: 3 } },
});

export const HorizontalRuleControl = createControl({
  label: 'hrControlLabel',
  icon: () => <Hr />,
  operation: { name: 'setHorizontalRule' },
});

export const AlignLeftControl = createControl({
  label: 'alignLeftControlLabel',
  icon: () => <TextLeft />,
  isActive: { name: null, attributes: { textAlign: 'left' } },
  operation: {
    name: 'setTextAlign',
    attributes: 'left',
  },
});

export const AlignRightControl = createControl({
  label: 'alignRightControlLabel',
  icon: () => <TextRight />,
  isActive: { name: null, attributes: { textAlign: 'right' } },
  operation: { name: 'setTextAlign', attributes: 'right' },
});

export const AlignCenterControl = createControl({
  label: 'alignCenterControlLabel',
  icon: () => <TextCenter />,
  isActive: { name: null, attributes: { textAlign: 'center' } },
  operation: { name: 'setTextAlign', attributes: 'center' },
});

export const AlignJustifyControl = createControl({
  label: 'alignJustifyControlLabel',
  icon: () => <Justify />,
  isActive: { name: null, attributes: { textAlign: 'justify' } },
  operation: { name: 'setTextAlign', attributes: 'justify' },
});

export const ImageControl = createControl({
  label: 'imageControlLabel',
  icon: () => <Justify />,
  isActive: { name: null, attributes: { textAlign: 'justify' } },
  operation: { name: 'setTextAlign', attributes: 'justify' },
});

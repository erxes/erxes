import React from 'react';
import {
  TypeBold,
  TypeH1,
  TypeH2,
  TypeH3,
  TypeItalic,
  TypeStrikethrough,
  ListOl,
  ListUl,
  TextLeft,
  TextRight,
  TextCenter,
  Justify
} from 'react-bootstrap-icons';

import { createControl } from './RichTextEditorControl';
import Icon from '../../Icon';

export const BoldControl = createControl({
  label: 'boldControlLabel',
  icon: props => <TypeBold />,
  isActive: { name: 'bold' },
  operation: { name: 'toggleBold' }
});

export const ItalicControl = createControl({
  label: 'italicControlLabel',
  icon: props => <TypeItalic />,
  isActive: { name: 'italic' },
  operation: { name: 'toggleItalic' }
});

export const StrikeThroughControl = createControl({
  label: 'strikeControlLabel',
  icon: props => <TypeStrikethrough />,
  isActive: { name: 'strike' },
  operation: { name: 'toggleStrike' }
});

export const UnlinkControl = createControl({
  label: 'unlinkControlLabel',
  icon: props => <Icon icon="link-broken" />,
  operation: { name: 'unsetLink' }
});

export const BulletListControl = createControl({
  label: 'bulletListControlLabel',
  icon: props => <ListUl />,
  isActive: { name: 'bulletList' },
  operation: { name: 'toggleBulletList' }
});

export const OrderedListControl = createControl({
  label: 'orderedListControlLabel',
  icon: props => <ListOl />,
  isActive: { name: 'orderedList' },
  operation: { name: 'toggleOrderedList' }
});

export const H1Control = createControl({
  label: 'h1ControlLabel',
  icon: props => <TypeH1 />,
  isActive: { name: 'heading', attributes: { level: 1 } },
  operation: { name: 'toggleHeading', attributes: { level: 1 } }
});

export const H2Control = createControl({
  label: 'h2ControlLabel',
  icon: props => <TypeH2 />,
  isActive: { name: 'heading', attributes: { level: 2 } },
  operation: { name: 'toggleHeading', attributes: { level: 2 } }
});

export const H3Control = createControl({
  label: 'h3ControlLabel',
  icon: props => <TypeH3 />,
  isActive: { name: 'heading', attributes: { level: 3 } },
  operation: { name: 'toggleHeading', attributes: { level: 3 } }
});

export const AlignLeftControl = createControl({
  label: 'alignLeftControlLabel',
  icon: props => <TextLeft />,
  isActive: { name: null, attributes: { textAlign: 'left' } },
  operation: {
    name: 'setTextAlign',
    attributes: 'left'
  }
});

export const AlignRightControl = createControl({
  label: 'alignRightControlLabel',
  icon: props => <TextRight />,
  isActive: { name: null, attributes: { textAlign: 'right' } },
  operation: { name: 'setTextAlign', attributes: 'right' }
});

export const AlignCenterControl = createControl({
  label: 'alignCenterControlLabel',
  icon: props => <TextCenter />,
  isActive: { name: null, attributes: { textAlign: 'center' } },
  operation: { name: 'setTextAlign', attributes: 'center' }
});

export const AlignJustifyControl = createControl({
  label: 'alignJustifyControlLabel',
  icon: props => <Justify />,
  isActive: { name: null, attributes: { textAlign: 'justify' } },
  operation: { name: 'setTextAlign', attributes: 'justify' }
});

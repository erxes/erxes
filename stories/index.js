import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, select, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import Button from '../src/modules/common/components/Button';
import Label from '../src/modules/common/components/Label';
import Icon from '../src/modules/common/components/Icon';
import TextDivider from '../src/modules/common/components/TextDivider';
import 'ionicons/css/ionicons.min.css';

import Typography from "./Typography";

storiesOf('Typography', module)
  .addDecorator(withKnobs)
  .add("Primary", () => (
    <Typography />
  ));

storiesOf('Button', module)
  .addDecorator(withKnobs)
  .add('Primary', () => (
    <Button
      btnStyle={select('Color',
      ['primary', 'default', 'success', 'danger', 'warning', 'simple', 'link'],
      'default' )}
      size={select('Size', ['large', 'medium', 'small'], 'medium')}
      disabled={boolean('Disabled', false)}
      block={boolean('Block', false)}
      href={select('Href', [null, 'href'], '')}
      onClick={ action('button-click') }
    >
      <Icon icon="checkmark" />
      {text('Text', 'Normal')}
    </Button>
  ));

storiesOf('Label', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <Label
      lblStyle={select('Color',
      ['primary', 'default', 'success', 'danger', 'warning'],
      'default' )}
    >
      {text('Text', 'Hello Tag')}
    </Label>
  ));

  storiesOf('TextDivider', module)
    .addDecorator(withKnobs)
    .add('Default', () => (
      <TextDivider text={text('Text', 'Information text is here')} />
    ));

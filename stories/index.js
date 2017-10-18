import React from 'react';
import { storiesOf, linkTo } from '@storybook/react';
import { withKnobs, text, select, boolean } from '@storybook/addon-knobs';
// import 'ionicons/css/ionicons.min.css';
import Button from '../src/components/Button';
import Label from '../src/components/Tag';
import Icon from '../src/components/Icon';

storiesOf('Button', module)
  .addDecorator(withKnobs)
  .add('Primary', () => (
    <Button
      styledType={select('Color', 
      ['primary', 'default', 'success', 'danger', 'warning', 'simple'], 
      'default' )}
      size={select('Size', ['large', 'medium', 'small', 'xsmall'], 'medium')}
      disabled={boolean('Disabled', false)}
      block={select('Block', ['default', 'block'], 'default')}
    >
      <Icon icon="arrow-left-a" />
      {text('Text', 'Hello Button')}
    </Button>
  ))
  .add('Link', () => (
    <Button
      onClick={linkTo('Button', 'Primary')}
    >
      {text('Text', 'Click me')}
    </Button>
  ));

storiesOf('Label', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <Label
      styledType={select('Color', 
      ['primary', 'default', 'success', 'danger', 'warning'], 
      'default' )}
    >
      {text('Text', 'Hello Tag')}
    </Label>
  ));
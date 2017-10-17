import React from 'react';
import { storiesOf, linkTo } from '@storybook/react';
import { withKnobs, text, select, boolean } from '@storybook/addon-knobs';

import Button from '../src/components/Button';
import Tag from '../src/components/Tag';

storiesOf('Button', module)
  .addDecorator(withKnobs)
  .add('Primary', () => (
    <Button
      styledType={select('Color', ['primary', 'default', 'success', 'danger', 'warning', 'simple'], 'default')}
      size={select('Size', ['large', 'medium', 'small', 'xsmall'], 'medium')}
      disabled={boolean('Disabled', false)}
      block={select('Block', ['default', 'block'], 'default')}
    >
      {text('Text', 'Hello Button')}
    </Button>
  ))
  .add('Icon Button', () => (
    <Button
    >
      {text('Text', 'Click me')}
    </Button>
  ))
  .add('Link', () => (
    <Button
      onClick={linkTo('Button', 'Primary')}
    >
      {text('Text', 'Click me')}
    </Button>
  ));

storiesOf('Tag', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <Tag
      styledType={select('Color', ['primary', 'default', 'success', 'danger', 'warning', 'simple'], 'default')}
    >
      {text('Text', 'Hello Tag')}
    </Tag>
  ));
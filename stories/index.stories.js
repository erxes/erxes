import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, select, boolean } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';

import Typography from "./Typography";
import Button from '../src/modules/common/components/Button';
import Label from '../src/modules/common/components/Label';
import Icon from '../src/modules/common/components/Icon';
import TextDivider from '../src/modules/common/components/TextDivider';
import NameCard from '../src/modules/common/components/nameCard/NameCard';
import Loader from '../src/modules/common/components/Loader';
import Spinner from '../src/modules/common/components/Spinner';
import EmptyState from '../src/modules/common/components/EmptyState';


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

storiesOf('NameCard', module)
  .addDecorator(withKnobs)
  .add('Primary', () => (
    <NameCard
      firstLine={text('Text', 'Alice Caldwell')}
      secondLine={text('Text', 'alice@gmail.com')}
    >
      {text('Text', 'Hello Tag')}
    </NameCard>
  ));

storiesOf('Loader', module)
  .addDecorator(withKnobs)
  .add('Primary', () => (
    <Loader
    >
      {text('Text', 'Hello Tag')}
    </Loader>
  ));

storiesOf('EmptyState', module)
  .addDecorator(withKnobs)
  .add('Primary', () => (
    <EmptyState
      text={text('Text', 'Hi required text')}
      icon= "heart"
      linkUrl= {text('Text', 'Url')}
      linkText= {text('Text', 'Text')}
      size={select('Size', ['full', 'small'], 'small')}
    >
      {text('Text', 'Hello Tag')}
    </EmptyState>
  ));

storiesOf('Spinner', module)
  .addDecorator(withKnobs)
  .add('Primary', () => (
    <Spinner
    >
      {text('Text', 'Hello Tag')}
    </Spinner>
  ));

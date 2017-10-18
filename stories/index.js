import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, select, boolean } from '@storybook/addon-knobs';

import Button from '../src/components/Button';
import Label from '../src/components/Tag';
import Icon from '../src/components/Icon';
import 'ionicons/css/ionicons.min.css';

storiesOf('Button', module)
  .addDecorator(withKnobs)
  .add('Primary', () => (
    <Button
      nmStyle={select('Color', 
      ['primary', 'default', 'success', 'danger', 'warning', 'simple', 'link'], 
      'default' )}
      size={select('Size', ['large', 'medium', 'small'], 'medium')}
      disabled={boolean('Disabled', false)}
      label={select('Block', ['default', 'label'], 'default')}
      href={select('Href', [null, 'href'], null)}
    >
      <Icon icon="ios-home" size="1.2"/>
      {text('Text', 'Hello Button')}
    </Button>
  ));

storiesOf('Label', module)
  .addDecorator(withKnobs)
  .add('Default', () => (
    <Label
      nmStyle={select('Color', 
      ['primary', 'default', 'success', 'danger', 'warning'], 
      'default' )}
    >
      {text('Text', 'Hello Tag')}
    </Label>
  ));
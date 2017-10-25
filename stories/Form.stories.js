import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';

import { FormControl, ControlLabel } from '../src/modules/common/components/Form';

const stories = storiesOf('Form Control', module);

stories.addDecorator(withKnobs);

stories
  .add('Text input', () => (
    <div>
      <ControlLabel>First name</ControlLabel>
      <FormControl defaultValue="Text input" type="email" required />
    </div>
  ))
  .add('File', () => (
    <div>
      <ControlLabel>File</ControlLabel>
      <FormControl type="file" />
    </div>
  ))
  .add('Select', () => (
    <div>
      <ControlLabel>Select</ControlLabel>
      <FormControl defaultValue="2" componentClass="select">
        <option value="1">Toyota</option>
        <option value="2">Subaru</option>
        <option value="3">Honda</option>
        <option value="4">Suzuki</option>
      </FormControl>
    </div>
  ))
  .add('Textarea', () => (
    <div>
      <ControlLabel>Textarea</ControlLabel>
      <FormControl defaultValue="Textarea" componentClass="textarea" />
    </div>
  ))
  .add('Checkbox', () => (
    <div>
      <ControlLabel>Checkbox</ControlLabel> <br/>
      <FormControl defaultChecked={true} componentClass="checkbox" />
      <FormControl defaultChecked={false} componentClass="checkbox">
        checkbox
      </FormControl>
    </div>
  ))
  .add('Radio button', () => (
    <div>
      <ControlLabel>Radio button</ControlLabel> <br/>
      <FormControl defaultChecked={true} name="radio" componentClass="radio" />
      <FormControl defaultChecked={false} name="radio" componentClass="radio">
        radio
      </FormControl>
    </div>
  ))
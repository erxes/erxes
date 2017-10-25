import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, text, select, boolean } from '@storybook/addon-knobs';

import Button from '../src/components/Button';
import Modal, {
  Modalheader,
  Modalbody,
  Modalfooter
} from '../src/components/Modal';
import Modalwrapper from '../src/components/Modal/modal-wrapper';
storiesOf('Modal', module)
  .addDecorator(withKnobs)
  .add('Modal', () => (
    <div>
      <Modal
        visible={boolean('visible', false)}
      >
        <Modalheader>
          <h2>Modal title</h2>
        </Modalheader>
        <Modalbody>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Modalbody>
        <Modalfooter />
      </Modal>
    </div>
  ));
storiesOf('Modalwrapper', module)
  .addDecorator(withKnobs)
  .add('Modalwrapper', () => <Modalwrapper />);

storiesOf('Button', module)
  .addDecorator(withKnobs)
  .add('Primary', () => (
    <Button
      color={select('Color', ['primary', 'default', 'success'], 'default')}
    >
      {text('Text', 'Hello Button')}
    </Button>
  ));

import * as React from 'react';
import { ShoutboxLauncher } from '../components';
import { AppConsumer } from './AppContext';

const container = () => (
  <AppConsumer>
    {({ isFormVisible, toggleShoutbox, getForm }) => {
      const form = getForm();

      return (
        <ShoutboxLauncher
          isFormVisible={isFormVisible}
          onClick={toggleShoutbox}
          color={form.themeColor || ''}
        />
      );
    }}
  </AppConsumer>
)

export default container;

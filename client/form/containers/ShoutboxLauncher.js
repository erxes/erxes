import React from 'react';
import { ShoutboxLauncher } from '../components';
import { AppConsumer } from './AppContext';

const container = (props) => (
  <AppConsumer>
    {({ isFormVisible, toggleShoutbox }) =>
      <ShoutboxLauncher
        {...props}
        isFormVisible={isFormVisible}
        onClick={toggleShoutbox}
      />
    }
  </AppConsumer>
)

export default container;

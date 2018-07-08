import React from 'react';
import { ShoutboxLauncher } from '../components';
import { AppConsumer } from './AppContext';

const container = () => (
  <AppConsumer>
    {({ isFormVisible, toggleShoutbox }) =>
      <ShoutboxLauncher isFormVisible={isFormVisible} onClick={toggleShoutbox} />
    }
  </AppConsumer>
)

export default container;

import * as React from 'react';
import { Messenger } from '../components';
import { AppConsumer } from './AppContext';

const messenger = () => (
  <AppConsumer>
    {({ activeRoute }) => <Messenger activeRoute={activeRoute} />}
  </AppConsumer>
)

export default messenger;
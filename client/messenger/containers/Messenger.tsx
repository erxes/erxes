import * as React from 'react';
import { AppConsumer } from './AppContext';
import { Messenger } from '../components';

const messenger = () => (
  <AppConsumer>
    {({ activeRoute }) => <Messenger activeRoute={activeRoute} />}
  </AppConsumer>
)

export default messenger;
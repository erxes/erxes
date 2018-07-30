import * as React from 'react';
import { App } from '../components';
import { AppConsumer, AppProvider } from './AppContext';

const container = () => (
  <AppProvider>
    <AppConsumer>
      {({ isMessengerVisible, saveBrowserInfo }) =>
        <App
          isMessengerVisible={isMessengerVisible}
          saveBrowserInfo={saveBrowserInfo}
        />
      }
    </AppConsumer>
  </AppProvider>
)

export default container;

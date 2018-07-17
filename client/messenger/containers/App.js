import React from 'react';
import { App } from '../components';
import { AppProvider, AppConsumer } from './AppContext';

const container = (props) => (
  <AppProvider>
    <AppConsumer>
      {({ isMessengerVisible, saveBrowserInfo }) =>
        <App
          {...props}
          isMessengerVisible={isMessengerVisible}
          saveBrowserInfo={saveBrowserInfo}
        />
      }
    </AppConsumer>
  </AppProvider>
)

export default container;

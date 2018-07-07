import React from 'react';
import { AppProvider, AppConsumer } from './AppContext';
import { connection } from '../connection';
import { App as DumbApp } from '../components';

class App extends React.Component {
  render() {
    return (
      <AppProvider>
        <AppConsumer>
          {({ isMessengerVisible, isBrowserInfoSaved, saveBrowserInfo }) =>
            <DumbApp
              isMessengerVisible={isMessengerVisible}
              isBrowserInfoSaved={isBrowserInfoSaved}
              uiOptions={connection.data.uiOptions || {}}
              saveBrowserInfo={saveBrowserInfo}
            />
          }
        </AppConsumer>
      </AppProvider>
    )
  }
}

export default App;

import React from 'react';
import { AppProvider, AppConsumer } from './AppContext';
import { App as DumbApp } from '../components';

class App extends React.Component {
  render() {
    return (
      <AppProvider>
        <AppConsumer>
          {({ isMessengerVisible, saveBrowserInfo }) =>
            <DumbApp
              isMessengerVisible={isMessengerVisible}
              saveBrowserInfo={saveBrowserInfo}
            />
          }
        </AppConsumer>
      </AppProvider>
    )
  }
}

export default App;

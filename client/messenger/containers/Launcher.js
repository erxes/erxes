import React from 'react';
import { AppConsumer } from './AppContext';
import { Launcher as DumbLauncher } from '../components';

export default class Launcher extends React.Component {
  render() {
    return (
      <AppConsumer>
        {({ isMessengerVisible, isBrowserInfoSaved, toggle }) => {
          return (
            <DumbLauncher
              {...this.props}
              isMessengerVisible={isMessengerVisible}
              isBrowserInfoSaved={isBrowserInfoSaved}
              onClick={toggle}
            />
          );
        }}
      </AppConsumer>
    )
  }
}

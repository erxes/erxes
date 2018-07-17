import React from 'react';
import { AppConsumer } from './AppContext';
import { Messenger as DumbMessenger } from '../components';
import { connection } from '../connection';

export default class Messenger extends React.Component {
  render() {
    return (
      <AppConsumer>
        {({ activeRoute }) => {
          return (
            <DumbMessenger
              {...this.props}
              activeRoute={activeRoute}
              color={connection.data.uiOptions && connection.data.uiOptions.color}
            />
          );
        }}
      </AppConsumer>
    )
  }
}

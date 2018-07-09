import React from 'react';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import { AccquireInformation as DumbAccquireInformation } from '../components';

export default class AccquireInformation extends React.Component {
  render() {
    return (
      <AppConsumer>
        {({ saveGetNotified }) => {
          return (
            <DumbAccquireInformation
              {...this.props}
              color={connection.data.uiOptions && connection.data.uiOptions.color}
              save={saveGetNotified}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

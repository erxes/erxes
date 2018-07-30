import * as React from 'react';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import { AccquireInformation as DumbAccquireInformation } from '../components';

export default class AccquireInformation extends React.Component {
  render() {
    return (
      <AppConsumer>
        {({ saveGetNotified, getColor }) => {
          return (
            <DumbAccquireInformation
              color={getColor()}
              save={saveGetNotified}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

import * as React from 'react';
import { AppConsumer } from './AppContext';
import { AccquireInformation } from '../components';

export default class extends React.Component {
  render() {
    return (
      <AppConsumer>
        {({ saveGetNotified, getColor }) => {
          return (
            <AccquireInformation
              color={getColor()}
              save={saveGetNotified}
            />
          );
        }}
      </AppConsumer>
    );
  }
}
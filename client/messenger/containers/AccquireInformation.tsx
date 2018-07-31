import * as React from 'react';
import { AccquireInformation } from '../components';
import { AppConsumer } from './AppContext';

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
import * as React from 'react';
import { AccquireInformation } from '../components';
import { AppConsumer } from './AppContext';

export default class extends React.Component {
  render() {
    return (
      <AppConsumer>
        {({ saveGetNotified, getColor, isSavingNotified, getUiOptions }) => {
          return (
            <AccquireInformation
              color={getColor()}
              textColor={getUiOptions().textColor || '#fff'}
              save={saveGetNotified}
              loading={isSavingNotified}
              showTitle={true}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

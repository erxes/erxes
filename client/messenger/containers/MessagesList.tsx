import * as React from 'react';
import { AppConsumer } from './AppContext';
import { MessagesList } from '../components';
import { IMessage } from '../types';

type Props = {
  messages: IMessage[],
  isOnline: boolean,
}

export default class extends React.Component<Props> {
  render() {
    return (
      <AppConsumer>
        {({ getUiOptions, getMessengerData }) => {
          return (
            <MessagesList 
              {...this.props}
              uiOptions={getUiOptions()}
              messengerData={getMessengerData()}
            />
          );
        }}
      </AppConsumer>
    );
  }
}
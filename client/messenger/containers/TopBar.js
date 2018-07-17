import React from 'react';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import { TopBar } from '../components';

const container = (props) => {
  return (
    <AppConsumer>
      {({ endConversation }) => {
        return (
          <TopBar
            {...props}
            color={connection.data.uiOptions && connection.data.uiOptions.color}
            isChat={Boolean(!connection.setting.email)}
            endConversation={endConversation}
          />
        )
      }}
    </AppConsumer>
  );
}

export default container;

import * as React from 'react';
import { compose, graphql, ChildProps } from 'react-apollo';
import gql from 'graphql-tag';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import { IConversation, IUser } from '../types';
import graphqlTypes from '../graphql';
import { Conversation as DumbConversation } from '../components';

type Response = {
  conversationDetail: IConversation
}

class ConversationCreate extends React.Component<ChildProps<{}, Response>, {}> {
  render() {
    let isOnline = false;
    let supporters: IUser[] = [];

    const data = this.props.data;

    if (data && data.conversationDetail) {
      const { conversationDetail } = data;
      
      isOnline = conversationDetail.isOnline;
      supporters = conversationDetail.supporters || [];
    }

    return (
      <AppConsumer>
        {({ goToConversationList, getColor }) => {
          return (
            <DumbConversation
              {...this.props}
              isNew={true} 
              color={getColor()}
              messages={[]}
              users={supporters}
              isOnline={isOnline}
              goToConversationList={goToConversationList}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

const query = compose(
  graphql<{}, {}>(
    gql(graphqlTypes.conversationDetailQuery),
    {
      options: () => ({
        variables: {
          integrationId: connection.data.integrationId,
        },
        fetchPolicy: 'network-only',
      }),
    },
  ),
);

export default query(ConversationCreate);

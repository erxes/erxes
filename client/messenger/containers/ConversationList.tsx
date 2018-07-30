import * as React from 'react';
import { graphql, ChildProps } from 'react-apollo';
import gql from 'graphql-tag';
import { AppConsumer } from './AppContext';
import { connection } from '../connection';
import { ConversationList as DumbConversationList } from '../components';
import graphqTypes from '../graphql';
import { IConversation } from '../types';

type QueryResponse = {
  conversations: IConversation[]
}

class ConversationList extends React.Component<ChildProps<{}, QueryResponse>, {}> {
  render() {
    const { data={ conversations: [], loading: true } } = this.props;

    let conversations = data.conversations || [];

    // show empty list while waiting
    if (data.loading) {
      conversations = [];
    }

    return (
      <AppConsumer>
        {({ changeRoute, goToConversation }) => {
          const createConversation = (e: React.FormEvent<HTMLButtonElement>) => {
            e.preventDefault();
            changeRoute('conversationCreate');
          }

          return (
            <DumbConversationList
              {...this.props}
              loading={data.loading}
              createConversation={createConversation}
              conversations={conversations}
              goToConversation={goToConversation}
            />
          );
        }}
      </AppConsumer>
    );
  }
}

const ListWithData = graphql<{}, QueryResponse>(
  gql(graphqTypes.allConversations),
  {
    options: () => ({
      fetchPolicy: 'network-only',
      variables: connection.data,
    }),
  },
)(ConversationList);

export default ListWithData;

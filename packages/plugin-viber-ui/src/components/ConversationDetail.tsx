import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import * as compose from 'lodash.flowright';
import React from 'react';
import { queries } from '../graphql';
import ViberMessage from './conversation/ViberMessage';

class Detail extends React.Component<any> {
  render() {
    const { currentConversation, messagesQuery } = this.props;

    if (messagesQuery.loading) {
      return null;
    }

    const messages = messagesQuery.viberConversationMessages || [];

    return (
      <ViberMessage
        conversation={currentConversation}
        conversationMessages={messages}
      />
    );
  }
}

const WithQuery = compose(
  graphql<any>(gql(queries.messages), {
    name: 'messagesQuery',
    options: ({ currentId }) => {
      return {
        variables: {
          conversationId: currentId
        },
        fetchPolicy: 'network-only'
      };
    }
  })
)(Detail);

export default WithQuery;

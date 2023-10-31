import React from 'react';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { __ } from 'coreui/utils';
import MailConversation from '@erxes/ui-inbox/src/inbox/components/conversationDetail/workarea/mail/MailConversation';
import { queries } from '../graphql';

class Detail extends React.Component<any> {
  render() {
    const { currentConversation, messagesQuery } = this.props;

    if (messagesQuery.loading) {
      return null;
    }

    const messages = messagesQuery.imapConversationDetail || [];

    return (
      <MailConversation
        detailQuery={messagesQuery}
        conversation={currentConversation}
        conversationMessages={messages}
      />
    );
  }
}

const WithQuery = compose(
  graphql<any>(gql(queries.detail), {
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

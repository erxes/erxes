import gql from 'graphql-tag';
import Conversation from 'modules/activityLogs/components/items/conversation/Conversation';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/inbox/graphql';
import { ConversationDetailQueryResponse } from 'modules/inbox/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  activity: any;
  conversationId: string;
};

type FinalProps = {
  conversationDetailQuery: ConversationDetailQueryResponse;
} & Props;

class ConversationContainer extends React.Component<FinalProps> {
  render() {
    const { conversationDetailQuery } = this.props;

    if (conversationDetailQuery.loading) {
      return <Spinner />;
    }

    const conversation = conversationDetailQuery.conversationDetail;

    const updatedProps = {
      ...this.props,
      conversation
    };

    return <Conversation {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConversationDetailQueryResponse>(
      gql(queries.conversationDetail),
      {
        name: 'conversationDetailQuery',
        options: ({ conversationId }) => ({
          variables: {
            _id: conversationId
          }
        })
      }
    )
  )(ConversationContainer)
);

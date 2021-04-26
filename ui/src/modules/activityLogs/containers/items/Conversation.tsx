import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Conversation from 'modules/activityLogs/components/items/Conversation';
import { IActivityLog } from 'modules/activityLogs/types';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/inbox/graphql';
import {
  ConversationDetailQueryResponse,
  FacebookCommentsQueryResponse,
  MessagesQueryResponse
} from 'modules/inbox/types';
import React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  activity: IActivityLog;
  conversationId: string;
};

type FinalProps = {
  messagesQuery: MessagesQueryResponse;
  commentsQuery: FacebookCommentsQueryResponse;
  conversationDetailQuery: ConversationDetailQueryResponse;
} & Props;

class ConversationContainer extends React.Component<FinalProps> {
  render() {
    const {
      conversationDetailQuery,
      messagesQuery,
      commentsQuery
    } = this.props;

    if (conversationDetailQuery.loading || messagesQuery.loading) {
      return <Spinner />;
    }

    const conversation = conversationDetailQuery.conversationDetail;
    const messages = messagesQuery.conversationMessages || [];
    const comments =
      (commentsQuery && commentsQuery.converstationFacebookComments) || [];

    const updatedProps = {
      ...this.props,
      conversation,
      messages,
      comments
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
    ),
    graphql<Props, MessagesQueryResponse>(gql(queries.conversationMessages), {
      name: 'messagesQuery',
      options: ({ conversationId }) => ({
        variables: {
          conversationId,
          limit: 10,
          getFirst: true
        }
      })
    }),
    graphql<Props, FacebookCommentsQueryResponse>(
      gql(queries.converstationFacebookComments),
      {
        name: 'commentsQuery',
        skip: ({ activity }) => activity.contentType !== 'comment',
        options: ({ conversationId, activity }) => ({
          variables: {
            postId: conversationId,
            senderId: activity.contentId
          }
        })
      }
    )
  )(ConversationContainer)
);

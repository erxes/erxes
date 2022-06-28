import * as compose from 'lodash.flowright';

import Conversation from '../../components/items/Conversation';
import { IActivityLog } from '@erxes/ui/src/activityLogs/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import asyncComponent from '../../../components/AsyncComponent';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { isEnabled } from '../../../utils/core';
import { withProps } from '@erxes/ui/src/utils';

const conversationMessages = asyncComponent(
  () =>
    isEnabled('inbox') &&
    import(
      /* webpackChunkName: "conversationMessages" */ '@erxes/ui-inbox/src/inbox/graphql/queries'
    )
);

const integrationsConversationFbComments = asyncComponent(
  () =>
    isEnabled('inbox') &&
    import(
      /* webpackChunkName: "integrationsConversationFbComments" */ '@erxes/ui-inbox/src/inbox/graphql/queries'
    )
);

const conversationDetail = asyncComponent(
  () =>
    isEnabled('inbox') &&
    import(
      /* webpackChunkName: "conversationDetail" */ '@erxes/ui-inbox/src/inbox/graphql/queries'
    )
);

type Props = {
  activity: IActivityLog;
  conversationId: string;
};

type FinalProps = {
  messagesQuery: any; //check - MessagesQueryResponse
  commentsQuery: any; //check - FacebookCommentsQueryResponse
  conversationDetailQuery: any; //check - ConversationDetailQueryResponse
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
      (commentsQuery && commentsQuery.integrationsConversationFbComments) || [];

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
    graphql<Props, any>(gql(conversationDetail), {
      name: 'conversationDetailQuery',
      options: ({ conversationId }) => ({
        variables: {
          _id: conversationId
        }
      }),
      skip: !isEnabled('inbox')
    }),
    graphql<Props, any>(gql(conversationMessages), {
      name: 'messagesQuery',
      options: ({ conversationId }) => ({
        variables: {
          conversationId,
          limit: 10,
          getFirst: true
        }
      }),
      skip: !isEnabled('inbox')
    }),
    graphql<Props, any>(gql(integrationsConversationFbComments), {
      name: 'commentsQuery',
      skip: ({ activity }) =>
        activity.contentType !== 'comment' || !isEnabled('inbox'),
      options: ({ conversationId, activity }) => ({
        variables: {
          postId: conversationId,
          senderId: activity.contentId
        }
      })
    })
  )(ConversationContainer)
);

import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import { router as routerUtils, withProps } from 'modules/common/utils';
import ConversationList from 'modules/inbox/components/leftSidebar/ConversationList';
import { queries, subscriptions } from 'modules/inbox/graphql';
import { generateParams } from 'modules/inbox/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  ConversationsQueryResponse,
  ConvesationsQueryVariables,
  IConversation
} from '../../types';
import { ConversationsTotalCountQueryResponse } from '../../types';
import { InboxManagementActionConsumer } from '../Inbox';

type Props = {
  currentUser?: IUser;
  history: any;
  currentConversationId?: string;
  toggleRowCheckbox: (conversation: IConversation[], checked: boolean) => void;
  selectedConversations: IConversation[];
  queryParams: any;
};

type FinalProps = {
  conversationsQuery: ConversationsQueryResponse;
  totalCountQuery: ConversationsTotalCountQueryResponse;
  updateCountsForNewMessage: () => void;
} & Props;

class ConversationListContainer extends React.PureComponent<FinalProps> {
  componentWillMount() {
    const {
      currentUser,
      conversationsQuery,
      totalCountQuery,
      updateCountsForNewMessage
    } = this.props;

    conversationsQuery.subscribeToMore({
      document: gql(subscriptions.conversationClientMessageInserted),
      variables: { userId: currentUser ? currentUser._id : null },
      updateQuery: () => {
        if (updateCountsForNewMessage) {
          updateCountsForNewMessage();
        }

        conversationsQuery.refetch();
        totalCountQuery.refetch();
      }
    });
  }

  render() {
    const { history, conversationsQuery, totalCountQuery } = this.props;

    const conversations = conversationsQuery.conversations || [];

    // on change conversation
    const onChangeConversation = conversation => {
      routerUtils.setParams(history, { _id: conversation._id });
    };

    const totalCount = totalCountQuery.conversationsTotalCount || 0;

    const updatedProps = {
      ...this.props,
      conversations,
      onChangeConversation,
      totalCount,
      loading: conversationsQuery.loading
    };

    return <ConversationList {...updatedProps} />;
  }
}

const ConversationListContainerWithRefetch = props => (
  <InboxManagementActionConsumer>
    {({ notifyConsumersOfManagementAction }) => (
      <ConversationListContainer
        {...props}
        updateCountsForNewMessage={notifyConsumersOfManagementAction}
      />
    )}
  </InboxManagementActionConsumer>
);

const generateOptions = queryParams => ({
  ...queryParams,
  limit: queryParams.limit ? parseInt(queryParams.limit, 10) : 10
});

export default withProps<Props>(
  compose(
    graphql<Props, ConversationsQueryResponse, ConvesationsQueryVariables>(
      gql(queries.sidebarConversations),
      {
        name: 'conversationsQuery',
        options: ({ queryParams }) => ({
          variables: generateParams(queryParams),
          notifyOnNetworkStatusChange: true,
          fetchPolicy: 'network-only',
          // every minute
          pollInterval: 60000
        })
      }
    ),
    graphql<Props, ConversationsTotalCountQueryResponse>(
      gql(queries.totalConversationsCount),
      {
        name: 'totalCountQuery',
        options: ({ queryParams }) => ({
          notifyOnNetworkStatusChange: true,
          variables: generateOptions(queryParams)
        })
      }
    )
  )(ConversationListContainerWithRefetch)
);

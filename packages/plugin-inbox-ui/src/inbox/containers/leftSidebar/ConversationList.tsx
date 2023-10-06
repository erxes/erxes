import * as compose from 'lodash.flowright';

import {
  ConversationsQueryResponse,
  ConvesationsQueryVariables,
  IConversation
} from '@erxes/ui-inbox/src/inbox/types';
import {
  getSubdomain,
  router as routerUtils,
  withProps
} from '@erxes/ui/src/utils';
import { queries, subscriptions } from '@erxes/ui-inbox/src/inbox/graphql';

import ConversationList from '../../components/leftSidebar/ConversationList';
import { ConversationsTotalCountQueryResponse } from '@erxes/ui-inbox/src/inbox/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { InboxManagementActionConsumer } from '../InboxCore';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generateParams } from '@erxes/ui-inbox/src/inbox/utils';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  currentUser?: IUser;
  history: any;
  currentConversationId?: string;
  toggleRowCheckbox: (conversation: IConversation[], checked: boolean) => void;
  selectedConversations: IConversation[];
  queryParams: any;
  counts?: any;
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
      variables: {
        subdomain: getSubdomain(),
        userId: currentUser ? currentUser._id : null
      },
      updateQuery: () => {
        if (updateCountsForNewMessage) {
          updateCountsForNewMessage();
        }

        conversationsQuery.refetch();
        totalCountQuery.refetch();
      }
    });
  }

  getTotalCount() {
    const { queryParams, counts, totalCountQuery } = this.props;

    let totalCount = totalCountQuery.conversationsTotalCount || 0;

    if (queryParams && counts) {
      if (queryParams.channelId && counts.byChannels) {
        totalCount += counts.byChannels[queryParams.channelId] || 0;
      }
      if (queryParams.segment && counts.bySegment) {
        totalCount += counts.bySegment[queryParams.segment] || 0;
      }
      if (queryParams.integrationType && counts.byIntegrationTypes) {
        totalCount +=
          counts.byIntegrationTypes[queryParams.integrationType] || 0;
      }
      if (queryParams.tag && counts.byTags) {
        const tags = queryParams.tag.split(',');

        for (const tag of tags) {
          totalCount += counts.byTags[tag] || 0;
        }
      }
    }

    return totalCount;
  }

  render() {
    const { history, conversationsQuery } = this.props;

    if (conversationsQuery.loading) {
      return <Spinner />;
    }

    const conversations = conversationsQuery.conversations || [];

    // on change conversation
    const onChangeConversation = conversation => {
      routerUtils.setParams(history, { _id: conversation._id });
    };

    const onLoadMore = () => {
      return conversationsQuery.fetchMore({
        variables: {
          skip: conversations.length
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.conversations.length === 0) {
            return prevResult;
          }

          const prevConversations = prevResult.conversations || [];
          const prevConversationIds = prevConversations.map(
            (conversation: IConversation) => conversation._id
          );

          const fetchedConversations: IConversation[] = [];

          for (const conversation of fetchMoreResult.conversations) {
            if (!prevConversationIds.includes(conversation._id)) {
              fetchedConversations.push(conversation);
            }
          }

          return {
            ...prevResult,
            conversations: [...prevConversations, ...fetchedConversations]
          };
        }
      });
    };

    const updatedProps = {
      ...this.props,
      onLoadMore,
      conversations,
      onChangeConversation,
      loading: conversationsQuery.loading,
      totalCount: this.getTotalCount()
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
          fetchPolicy: 'network-only'
          // every minute
          // commented this line because it was causing the page to refresh every minute and it was glitchy
          // pollInterval: 60000
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

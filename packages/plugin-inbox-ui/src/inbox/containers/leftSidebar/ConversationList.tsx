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

const ConversationListContainer = (props: FinalProps) => {
  const {
    currentUser,
    queryParams,
    counts,
    history,
    conversationsQuery,
    totalCountQuery,
    updateCountsForNewMessage
  } = props;

  React.useEffect(() => {
    if (!queryParams.isModalOpen) {
      return conversationsQuery.subscribeToMore({
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
  });

  const getTotalCount = () => {
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
  };

  const conversations = conversationsQuery.conversations || [];

  // on change conversation
  const onChangeConversation = conversation => {
    routerUtils.setParams(history, { _id: conversation._id });
  };

  const onLoadMore = () => {
    return (
      conversationsQuery &&
      conversationsQuery.fetchMore({
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
      })
    );
  };

  const updatedProps = {
    ...props,
    onLoadMore,
    conversations,
    onChangeConversation,
    loading: conversationsQuery.loading,
    totalCount: getTotalCount()
  };

  return <ConversationList {...updatedProps} />;
};

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

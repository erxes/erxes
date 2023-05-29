import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IUser } from '@erxes/ui/src/auth/types';
import {
  router as routerUtils,
  withProps,
  getSubdomain
} from '@erxes/ui/src/utils';
import ConversationList from '../../components/leftSidebar/ConversationList';
import { queries, subscriptions } from '@erxes/ui-inbox/src/inbox/graphql';
import { generateParams } from '@erxes/ui-inbox/src/inbox/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import {
  ConversationsQueryResponse,
  ConvesationsQueryVariables,
  IConversation
} from '@erxes/ui-inbox/src/inbox/types';
import { ConversationsTotalCountQueryResponse } from '@erxes/ui-inbox/src/inbox/types';
import { InboxManagementActionConsumer } from '../InboxCore';

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

    const conversations = conversationsQuery.conversations || [];

    // on change conversation
    const onChangeConversation = conversation => {
      routerUtils.setParams(history, { _id: conversation._id });
    };

    const updatedProps = {
      ...this.props,
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

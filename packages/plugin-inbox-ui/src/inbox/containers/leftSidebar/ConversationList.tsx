import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from '@erxes/ui/src/auth/types';
import { router as routerUtils, withProps } from '@erxes/ui/src/utils';
import ConversationList from '../../components/leftSidebar/ConversationList';
import { queries, subscriptions } from '@erxes/ui-inbox/src/inbox/graphql';
import { generateParams } from '@erxes/ui-inbox/src/inbox/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  ConversationsQueryResponse,
  ConvesationsQueryVariables,
  IConversation
} from '@erxes/ui-inbox/src/inbox/types';
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
  updateCountsForNewMessage: () => void;
} & Props;

class ConversationListContainer extends React.PureComponent<FinalProps> {
  componentWillMount() {
    const {
      currentUser,
      conversationsQuery,
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
      }
    });
  }

  getTotalCount() {
    const { queryParams, counts } = this.props;

    let total = 0;

    if (queryParams && counts) {
      if (queryParams.channelId && counts.byChannels) {
        total += counts.byChannels[queryParams.channelId] || 0;
      }
      if (queryParams.segment && counts.bySegment) {
        total += counts.bySegment[queryParams.segment] || 0;
      }
      if (queryParams.integrationType && counts.byIntegrationTypes) {
        total += counts.byIntegrationTypes[queryParams.integrationType] || 0;
      }
      if (queryParams.tag && counts.byTags) {
        const tags = queryParams.tag.split(',');

        for (const tag of tags) {
          total += counts.byTags[tag] || 0;
        }
      }
    }

    return total;
  }

  render() {
    const { history, conversationsQuery, queryParams } = this.props;

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
    )
  )(ConversationListContainerWithRefetch)
);

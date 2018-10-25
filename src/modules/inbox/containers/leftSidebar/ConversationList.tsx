import gql from 'graphql-tag';
import { router as routerUtils, withProps } from 'modules/common/utils';
import { ConversationList } from 'modules/inbox/components/leftSidebar';
import { queries, subscriptions } from 'modules/inbox/graphql';
import { generateParams } from 'modules/inbox/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  ConversationsQueryResponse,
  ConvesationsQueryVariables,
  IConversation
} from '../../types';

type Props = {
  history: any;
  currentConversationId?: string;
  toggleRowCheckbox: (conversation: IConversation[], checked: boolean) => void;
  selectedConversations: IConversation[];
  totalCount: number;
  queryParams: any;
};

type FinalProps = {
  conversationsQuery: ConversationsQueryResponse;
} & Props;

class ConversationListContainer extends React.Component<FinalProps> {
  componentWillMount() {
    const { conversationsQuery } = this.props;

    conversationsQuery.subscribeToMore({
      document: gql(subscriptions.conversationClientMessageInserted),
      updateQuery: () => {
        conversationsQuery.refetch();
      }
    });
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
      loading: conversationsQuery.loading
    };

    return <ConversationList {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConversationsQueryResponse, ConvesationsQueryVariables>(
      gql(queries.sidebarConversations),
      {
        name: 'conversationsQuery',
        options: ({ queryParams }) => ({
          variables: generateParams(queryParams),
          fetchPolicy: 'network-only'
        })
      }
    )
  )(ConversationListContainer)
);

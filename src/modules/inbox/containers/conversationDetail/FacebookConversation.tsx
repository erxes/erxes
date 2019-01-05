import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { queries } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { withProps } from '../../../common/utils';
import { FacebookConversation } from '../../components/conversationDetail';
import {
  FacebookMessagesQueryResponse,
  IConversation,
  IMessage
} from '../../types';

type Props = {
  conversation: IConversation;
  scrollBottom: () => void;
};

type FinalProps = {
  currentUser: IUser;
  messagesQuery: FacebookMessagesQueryResponse;
} & Props;

type State = {
  limit: number;
};

class FacebookConversationContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      limit: 1
    };
  }

  fetchMoreMessages = variables => {
    const { messagesQuery } = this.props;

    messagesQuery.fetchMore({
      variables,
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const fetchedMessagesQuery =
          fetchMoreResult.conversationMessagesFacebook || {};

        const fetchedMessages = fetchedMessagesQuery.list || [];

        const prevMessagesQuery = prev.conversationMessagesFacebook || {};

        const prevMessages = prevMessagesQuery.list || [];

        const prevMessageIds = prevMessages.map(m => m._id);

        const filteredMessages: IMessage[] = [];

        for (const message of fetchedMessages) {
          if (!prevMessageIds.includes(message._id)) {
            filteredMessages.push(message);
          }
        }

        return {
          conversationMessagesFacebook: {
            ...prev.conversationMessagesFacebook,
            list: [...filteredMessages, ...prevMessages]
          }
        };
      }
    });
  };

  fetchFacebook = ({
    commentId,
    postId,
    limit
  }: {
    commentId?: string;
    postId?: string;
    limit?: number;
  }) => {
    const { conversation } = this.props;
    const variables: { [key: string]: string | number } = {
      conversationId: conversation._id
    };

    if (commentId) {
      variables.commentId = commentId;
    }

    if (postId) {
      variables.postId = postId;
      variables.limit = limit || 5;
    }

    this.fetchMoreMessages(variables);
  };

  render() {
    const { messagesQuery } = this.props;

    const messagesQueryResult =
      messagesQuery.conversationMessagesFacebook || {};

    const updatedProps = {
      ...this.props,
      conversationMessages: messagesQueryResult.list || [],
      fetchFacebook: this.fetchFacebook
    };

    return <FacebookConversation {...updatedProps} />;
  }
}

const WithQuery = withProps<Props & { currentUser: IUser }>(
  compose(
    graphql<Props, FacebookMessagesQueryResponse, { conversationId: string }>(
      gql(queries.conversationMessagesFacebook),
      {
        name: 'messagesQuery',
        options: ({ conversation }: { conversation: IConversation }) => {
          return {
            variables: {
              conversationId: conversation._id
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    )
  )(FacebookConversationContainer)
);

const WithConsumer = (props: Props) => {
  return (
    <AppConsumer>
      {({ currentUser }) => (
        <WithQuery {...props} currentUser={currentUser || ({} as IUser)} />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;

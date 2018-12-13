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

        const fetchedMessages = fetchMoreResult.conversationMessagesFacebook
          ? fetchMoreResult.conversationMessagesFacebook.list
          : [];

        const prevMessages = prev.conversationMessagesFacebook
          ? prev.conversationMessagesFacebook.list
          : [];
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
    postId
  }: {
    commentId?: string;
    postId?: string;
  }) => {
    const { conversation } = this.props;
    const variables: { [key: string]: string | number } = {
      conversationId: conversation._id || ''
    };

    if (commentId) {
      variables.facebookCommentId = commentId;
    }

    if (postId) {
      variables.facebookPostId = postId;
    }

    this.fetchMoreMessages(variables);
  };

  render() {
    const { messagesQuery } = this.props;

    const updatedProps = {
      ...this.props,
      conversationMessages: messagesQuery.conversationMessagesFacebook
        ? messagesQuery.conversationMessagesFacebook.list
        : [],
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
        options: ({ conversation }: any) => {
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

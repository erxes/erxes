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
  loadingMessages: boolean;
};

class FacebookConversationContainer extends React.Component<FinalProps, State> {
  fetchMoreMessages = variables => {
    const { messagesQuery } = this.props;

    messagesQuery.fetchMore({
      variables,
      updateQuery: (prev, { fetchMoreResult }) => {
        this.setState({ loadingMessages: false });

        if (!fetchMoreResult) {
          return prev;
        }

        const prevMessageIds = (prev.conversationMessagesFacebook || []).map(
          m => m._id
        );

        const fetchedMessages: IMessage[] = [];

        for (const message of fetchMoreResult.conversationMessagesFacebook) {
          if (!prevMessageIds.includes(message._id)) {
            fetchedMessages.push(message);
          }
        }

        return {
          ...prev,
          conversationMessagesFacebook: [
            ...fetchedMessages,
            ...prev.conversationMessagesFacebook
          ]
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
    const variables: { [key: string]: string } = {
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
      conversationMessages: messagesQuery.conversationMessagesFacebook || [],
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

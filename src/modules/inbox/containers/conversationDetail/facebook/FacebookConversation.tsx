import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { withProps } from 'modules/common/utils';
import FacebookConversation from 'modules/inbox/components/conversationDetail/workarea/facebook/FacebookConversation';
import { queries, subscriptions } from 'modules/inbox/graphql';
import {
  FacebookCommentsQueryResponse,
  IConversation,
  IFacebookComment,
  IFacebookPost,
  MessagesQueryResponse
} from 'modules/inbox/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  conversation: IConversation;
  scrollBottom: () => void;
};

type FinalProps = {
  currentUser: IUser;
  commentsQuery: FacebookCommentsQueryResponse;
  internalNotesQuery: MessagesQueryResponse;
} & Props;

class FacebookPostContainer extends React.Component<FinalProps> {
  private subscription;

  constructor(props) {
    super(props);

    this.subscription = null;
  }

  componentWillReceiveProps(nextProps) {
    const { conversation, commentsQuery } = nextProps;

    // It is first time or subsequent conversation change
    if (
      !this.subscription ||
      conversation._id !== this.props.conversation._id
    ) {
      // Unsubscribe previous subscription ==========
      if (this.subscription) {
        this.subscription();
      }

      this.subscription = commentsQuery.subscribeToMore({
        document: gql(
          subscriptions.conversationExternalIntegrationMessageInserted
        ),
        updateQuery: () => {
          const comments = commentsQuery.facebookComments || [];
          const limit = comments.length + 10;

          this.fetchMoreComments({ limit }, { isSubscriptions: true });
        }
      });
    }
  }

  fetchMoreComments = (variables, isSubscriptions?) => {
    const { commentsQuery } = this.props;

    commentsQuery.fetchMore({
      variables,
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const prevComments = prev.facebookComments || [];

        const prevCommentIds = prevComments.map(
          (comment: IFacebookComment) => comment.commentId
        );

        const fetchedComments: IFacebookComment[] = [];
        for (const comment of fetchMoreResult.facebookComments) {
          if (!prevCommentIds.includes(comment.commentId)) {
            fetchedComments.push(comment);
          }
        }

        if (isSubscriptions) {
          return {
            ...prev,
            facebookComments: [...prevComments, ...fetchedComments]
          };
        }

        return {
          ...prev,
          facebookComments: [...fetchedComments, ...prevComments]
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
    const variables: { [key: string]: string | number } = {};

    if (commentId) {
      variables.commentId = commentId;
    }

    if (postId) {
      variables.postId = postId;
    }

    variables.limit = limit || 5;

    this.fetchMoreComments(variables);
  };

  render() {
    const { commentsQuery, conversation, internalNotesQuery } = this.props;

    if (commentsQuery.loading || internalNotesQuery.loading) {
      return null;
    }

    const post = conversation.facebookPost || ({} as IFacebookPost);
    const comments = commentsQuery.facebookComments || [];

    const hasMore = post.commentCount > comments.length;

    const updatedProps = {
      ...this.props,
      post,
      customer: conversation.customer || {},
      comments,
      internalNotes: internalNotesQuery.conversationMessages,
      hasMore,
      fetchFacebook: this.fetchFacebook
    };

    return <FacebookConversation {...updatedProps} />;
  }
}

const WithQuery = withProps<Props & { currentUser: IUser }>(
  compose(
    graphql<Props, FacebookCommentsQueryResponse, { postId: string }>(
      gql(queries.facebookComments),
      {
        name: 'commentsQuery',
        options: ({ conversation }: { conversation: IConversation }) => {
          return {
            variables: {
              postId: conversation.facebookPost
                ? conversation.facebookPost.postId
                : ''
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),
    graphql<Props, MessagesQueryResponse, { conversationId: string }>(
      gql(queries.conversationMessages),
      {
        name: 'internalNotesQuery',
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
  )(FacebookPostContainer)
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

// conversationMessages

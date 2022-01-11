import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IUser } from 'modules/auth/types';
import { withProps } from 'modules/common/utils';
import FacebookConversation from 'modules/inbox/components/conversationDetail/workarea/facebook/FacebookConversation';
import { queries, subscriptions } from 'modules/inbox/graphql';
import {
  FacebookCommentsCountQueryResponse,
  FacebookCommentsQueryResponse,
  IConversation,
  IFacebookComment,
  IFacebookPost,
  MessagesQueryResponse
} from 'modules/inbox/types';
import * as React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  conversation: IConversation;
  isResolved: boolean;
  onToggleClick: () => void;
  scrollBottom: () => void;
};

type FinalProps = {
  currentUser: IUser;
  commentsQuery: FacebookCommentsQueryResponse;
  commentsCountQuery: FacebookCommentsCountQueryResponse;
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
          const comments = commentsQuery.converstationFacebookComments || [];
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

        const prevComments = prev.converstationFacebookComments || [];

        const prevCommentIds = prevComments.map(
          (comment: IFacebookComment) => comment.commentId
        );

        const fetchedComments: IFacebookComment[] = [];
        for (const comment of fetchMoreResult.converstationFacebookComments) {
          if (!prevCommentIds.includes(comment.commentId)) {
            fetchedComments.push(comment);
          }
        }

        if (isSubscriptions) {
          return {
            ...prev,
            converstationFacebookComments: [...prevComments, ...fetchedComments]
          };
        }

        return {
          ...prev,
          converstationFacebookComments: [...fetchedComments, ...prevComments]
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
      variables.limit = 999;
    }

    if (postId) {
      variables.postId = postId;
    }

    variables.limit = limit || 5;

    this.fetchMoreComments(variables);
  };

  render() {
    const {
      commentsQuery,
      conversation,
      internalNotesQuery,
      commentsCountQuery
    } = this.props;

    if (
      commentsQuery.loading ||
      internalNotesQuery.loading ||
      commentsCountQuery.loading
    ) {
      return null;
    }

    const post = conversation.facebookPost || ({} as IFacebookPost);
    const comments = commentsQuery.converstationFacebookComments || [];
    const commentCounts =
      commentsCountQuery.converstationFacebookCommentsCount || {};

    const hasMore = commentCounts.commentCountWithoutReplies > comments.length;
    const commentCount = commentCounts.commentCount;

    const updatedProps = {
      ...this.props,
      commentCount,
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
    graphql<
      Props,
      FacebookCommentsQueryResponse,
      { postId: string; isResolved: boolean }
    >(gql(queries.converstationFacebookComments), {
      name: 'commentsQuery',
      options: ({
        conversation,
        isResolved
      }: {
        conversation: IConversation;
        isResolved: boolean;
      }) => {
        return {
          variables: {
            postId: conversation._id,
            isResolved
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<
      Props,
      FacebookCommentsCountQueryResponse,
      { postId: string; isResolved: boolean }
    >(gql(queries.converstationFacebookCommentsCount), {
      name: 'commentsCountQuery',
      options: ({
        conversation,
        isResolved
      }: {
        conversation: IConversation;
        isResolved: boolean;
      }) => {
        return {
          variables: {
            postId: conversation._id,
            isResolved
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
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

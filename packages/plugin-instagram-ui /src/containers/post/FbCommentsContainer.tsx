import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';

import { IUser } from '@erxes/ui/src/auth/types';
import { withProps } from '@erxes/ui/src/utils';
import {
  queries as inboxQueries,
  subscriptions as inboxSubscriptions
} from '@erxes/ui-inbox/src/inbox/graphql';
import { MessagesQueryResponse } from '@erxes/ui-inbox/src/inbox/types';
import { Spinner } from '@erxes/ui/src/components';

import { AppConsumer } from 'coreui/appContext';
import InstagramConversation from '../../components/conversationDetail/post/InstagramConversation';
import { queries } from '../../graphql/index';
import {
  InstagramCommentsCountQueryResponse,
  InstagramCommentsQueryResponse,
  InstagramPostQueryResponse,
  IInstagramComment,
  IFbConversation
} from '../../types';

type Props = {
  currentId: string;
  conversation: IFbConversation;
  isResolved: boolean;
  onToggleClick: () => void;
  scrollBottom: () => void;
};

type FinalProps = {
  currentUser: IUser;
  commentsQuery: InstagramCommentsQueryResponse;
  commentsCountQuery: InstagramCommentsCountQueryResponse;
  internalNotesQuery: MessagesQueryResponse;
  postQuery: InstagramPostQueryResponse;
} & Props;

class InstagramPostContainer extends React.Component<FinalProps> {
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
      (conversation && conversation._id !== this.props.conversation._id)
    ) {
      // Unsubscribe previous subscription ==========
      if (this.subscription) {
        this.subscription();
      }

      this.subscription = commentsQuery.subscribeToMore({
        document: gql(
          inboxSubscriptions.conversationExternalIntegrationMessageInserted
        ),
        updateQuery: () => {
          const comments = commentsQuery.instagramGetComments || [];
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

        const prevComments = prev.instagramGetComments || [];

        const prevCommentIds = prevComments.map(
          (comment: IInstagramComment) => comment.commentId
        );

        const fetchedComments: IInstagramComment[] = [];
        for (const comment of fetchMoreResult.instagramGetComments) {
          if (!prevCommentIds.includes(comment.commentId)) {
            fetchedComments.push(comment);
          }
        }

        if (isSubscriptions) {
          return {
            ...prev,
            instagramGetComments: [...prevComments, ...fetchedComments]
          };
        }

        return {
          ...prev,
          instagramGetComments: [...fetchedComments, ...prevComments]
        };
      }
    });
  };

  fetchInstagram = ({
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
      commentsCountQuery,
      postQuery
    } = this.props;

    if (
      postQuery.loading ||
      commentsQuery.loading ||
      internalNotesQuery.loading ||
      commentsCountQuery.loading
    ) {
      return <Spinner />;
    }

    if (!conversation) {
      return 'No conversation found';
    }

    const comments = commentsQuery.instagramGetComments || [];
    const commentCounts = commentsCountQuery.instagramGetCommentCount || {};

    const hasMore = commentCounts.commentCountWithoutReplies > comments.length;
    const commentCount = commentCounts.commentCount;

    const refetchComments = (isResolved: boolean) => {
      commentsQuery.refetch({ isResolved });
      commentsCountQuery.refetch({ isResolved });
    };

    const updatedProps = {
      ...this.props,
      commentCount,
      post: postQuery.instagramGetPost,
      customer: (conversation && conversation.customer) || ({} as any),
      comments,
      internalNotes: internalNotesQuery.conversationMessages,
      hasMore,
      fetchInstagram: this.fetchInstagram,
      refetchComments
    };

    return <InstagramConversation {...updatedProps} />;
  }
}

type Resolved = {
  isResolved: boolean;
};

type ConversationId = {
  conversationId: string;
} & Resolved;

const WithQuery = withProps<Props & { currentUser: IUser }>(
  compose(
    graphql<Props, InstagramCommentsQueryResponse, ConversationId>(
      gql(queries.instagramGetComments),
      {
        name: 'commentsQuery',
        options: ({ isResolved, currentId }) => {
          return {
            variables: {
              conversationId: currentId,
              isResolved
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),
    graphql<Props, InstagramCommentsCountQueryResponse, ConversationId>(
      gql(queries.instagramGetCommentCount),
      {
        name: 'commentsCountQuery',
        options: ({ isResolved, currentId }) => {
          return {
            variables: {
              conversationId: currentId,
              isResolved
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),
    graphql<Props, MessagesQueryResponse, { conversationId: string }>(
      gql(inboxQueries.conversationMessages),
      {
        name: 'internalNotesQuery',
        options: ({ currentId }) => {
          return {
            variables: {
              conversationId: currentId
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),
    graphql<Props, InstagramPostQueryResponse>(gql(queries.instagramGetPost), {
      name: 'postQuery',
      options: ({ currentId }) => ({
        variables: { erxesApiId: currentId }
      })
    })
  )(InstagramPostContainer)
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

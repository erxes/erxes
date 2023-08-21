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
import FacebookConversation from '../../components/conversationDetail/post/FacebookConversation';
import { queries } from '../../graphql/index';
import {
  FacebookCommentsCountQueryResponse,
  FacebookCommentsQueryResponse,
  FacebookPostQueryResponse,
  IFacebookComment,
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
  commentsQuery: FacebookCommentsQueryResponse;
  commentsCountQuery: FacebookCommentsCountQueryResponse;
  internalNotesQuery: MessagesQueryResponse;
  postQuery: FacebookPostQueryResponse;
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
          const comments = commentsQuery.facebookGetComments || [];
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

        const prevComments = prev.facebookGetComments || [];

        const prevCommentIds = prevComments.map(
          (comment: IFacebookComment) => comment.commentId
        );

        const fetchedComments: IFacebookComment[] = [];
        for (const comment of fetchMoreResult.facebookGetComments) {
          if (!prevCommentIds.includes(comment.commentId)) {
            fetchedComments.push(comment);
          }
        }

        if (isSubscriptions) {
          return {
            ...prev,
            facebookGetComments: [...prevComments, ...fetchedComments]
          };
        }

        return {
          ...prev,
          facebookGetComments: [...fetchedComments, ...prevComments]
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

    const comments = commentsQuery.facebookGetComments || [];
    const commentCounts = commentsCountQuery.facebookGetCommentCount || {};

    const hasMore = commentCounts.commentCountWithoutReplies > comments.length;
    const commentCount = commentCounts.commentCount;

    const refetchComments = (isResolved: boolean) => {
      commentsQuery.refetch({ isResolved });
      commentsCountQuery.refetch({ isResolved });
    };

    const updatedProps = {
      ...this.props,
      commentCount,
      post: postQuery.facebookGetPost,
      customer: (conversation && conversation.customer) || ({} as any),
      comments,
      internalNotes: internalNotesQuery.conversationMessages,
      hasMore,
      fetchFacebook: this.fetchFacebook,
      refetchComments
    };

    return <FacebookConversation {...updatedProps} />;
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
    graphql<Props, FacebookCommentsQueryResponse, ConversationId>(
      gql(queries.facebookGetComments),
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
    graphql<Props, FacebookCommentsCountQueryResponse, ConversationId>(
      gql(queries.facebookGetCommentCount),
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
    graphql<Props, FacebookPostQueryResponse>(gql(queries.facebookGetPost), {
      name: 'postQuery',
      options: ({ currentId }) => ({
        variables: { erxesApiId: currentId }
      })
    })
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

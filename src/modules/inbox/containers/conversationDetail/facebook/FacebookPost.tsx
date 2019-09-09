import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { IUser } from 'modules/auth/types';
import { withProps } from 'modules/common/utils';
import FacebookConversation from 'modules/inbox/components/conversationDetail/workarea/facebook/FacebookConversation';
import { queries } from 'modules/inbox/graphql';
import {
  FacebookCommentsQueryResponse,
  IConversation,
  IFacebookComment,
  IFacebookPost
} from 'modules/inbox/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  conversation: IConversation;
};

type FinalProps = {
  currentUser: IUser;
  commentsQuery: FacebookCommentsQueryResponse;
} & Props;

class FacebookPostContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  fetchMoreComments = variables => {
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
    const { commentsQuery, conversation } = this.props;

    const post = conversation.post || ({} as IFacebookPost);
    const comments = commentsQuery.facebookComments || [];

    const hasMore = post.commentCount > comments.length;

    const updatedProps = {
      post,
      customer: conversation.customer,
      comments,
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
              postId: conversation.post ? conversation.post.postId : ''
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

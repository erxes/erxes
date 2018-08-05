import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { ReplyingMessage } from 'modules/inbox/components/conversationDetail';
import { mutations } from 'modules/inbox/graphql';

const ReplyingMessageContainer = props => {
  const {
    replyMutation,
    conversationsLikeMutation,
    commentId,
    postId,
    integrationId,
    currentUserName
  } = props;

  const replyPost = (variables, callback) => {
    console.log(variables);
    replyMutation({ variables })
      .then(() => {
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const likePost = (variables, callback) => {
    console.log(variables);
    conversationsLikeMutation({ variables })
      .then(() => {
        console.log('like');
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    replyPost,
    likePost,
    commentId,
    postId,
    integrationId,
    currentUserName
  };

  return <ReplyingMessage {...updatedProps} />;
};

ReplyingMessageContainer.propTypes = {
  replyMutation: PropTypes.func,
  conversationsLikeMutation: PropTypes.func,
  commentId: PropTypes.string,
  postId: PropTypes.string,
  integrationId: PropTypes.string,
  currentUserName: PropTypes.string
};

export default compose(
  graphql(gql(mutations.conversationsLike), {
    name: 'conversationsLikeMutation'
  }),
  graphql(gql(mutations.conversationMessageAdd), {
    name: 'replyMutation'
  }),
  graphql(gql(mutations.tweet), { name: 'tweetMutation' })
)(ReplyingMessageContainer);

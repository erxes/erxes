import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { Message } from 'modules/inbox/components/conversationDetail';
import { mutations } from 'modules/inbox/graphql';

const FacebookMessageContainer = props => {
  const { replyMutation, conversationsLikeMutation, message } = props;

  const replyPost = (variables, callback) => {
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
    message
  };

  return <Message {...updatedProps} />;
};

FacebookMessageContainer.propTypes = {
  replyMutation: PropTypes.func,
  conversationsLikeMutation: PropTypes.func,
  message: PropTypes.object.isRequired
};

export default compose(
  graphql(gql(mutations.conversationsLike), {
    name: 'conversationsLikeMutation'
  }),
  graphql(gql(mutations.conversationMessageAdd), {
    name: 'replyMutation'
  }),
  graphql(gql(mutations.tweet), { name: 'tweetMutation' })
)(FacebookMessageContainer);

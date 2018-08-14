import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { FacebookComment } from 'modules/inbox/components/conversationDetail';
import { mutations } from 'modules/inbox/graphql';

const FacebookCommentContainer = props => {
  const { replyMutation, message, scrollBottom } = props;

  const replyPost = (variables, callback) => {
    replyMutation({ variables })
      .then(() => {
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    replyPost,
    message,
    scrollBottom
  };

  return <FacebookComment {...updatedProps} />;
};

FacebookCommentContainer.propTypes = {
  replyMutation: PropTypes.func,
  message: PropTypes.object.isRequired,
  scrollBottom: PropTypes.func
};

export default compose(
  graphql(gql(mutations.conversationMessageAdd), {
    name: 'replyMutation'
  })
)(FacebookCommentContainer);

import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { FacebookMessage } from 'modules/inbox/components/conversationDetail';
import { mutations } from 'modules/inbox/graphql';

const FacebookMessageContainer = props => {
  const { replyMutation, message } = props;

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
    message
  };

  return <FacebookMessage {...updatedProps} />;
};

FacebookMessageContainer.propTypes = {
  replyMutation: PropTypes.func,
  message: PropTypes.object.isRequired
};

export default compose(
  graphql(gql(mutations.conversationMessageAdd), {
    name: 'replyMutation'
  })
)(FacebookMessageContainer);

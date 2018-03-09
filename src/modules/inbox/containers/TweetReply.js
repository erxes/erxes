import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations } from '../graphql';
import { TweetReply } from '../components/conversation/TwitterConversation';

const TweetReplyContainer = props => {
  const { replyTweetMutation } = props;

  const replyTweet = (variables, callback) => {
    replyTweetMutation({ variables })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    ...props,
    replyTweet
  };

  return <TweetReply {...updatedProps} />;
};

TweetReplyContainer.propTypes = {
  replyTweetMutation: PropTypes.func
};

export default compose(
  graphql(gql(mutations.conversationTwitterAdd), { name: 'replyTweetMutation' })
)(TweetReplyContainer);

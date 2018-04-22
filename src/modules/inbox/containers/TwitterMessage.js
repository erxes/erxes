import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { mutations, queries } from '../graphql';
import { TwitterMessage } from '../components/conversation/TwitterConversation';

const TwitterMessageContainer = props => {
  const {
    replyTweetMutation,
    favoriteTweetMutation,
    tweetMutation,
    retweetMutation,
    currentConversationId
  } = props;

  const replyTweet = (variables, callback) => {
    replyTweetMutation({ variables })
      .then(() => {
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const retweet = (variables, callback) => {
    retweetMutation({ variables })
      .then(() => {
        callback();
        Alert.success('Successfully retweeted');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const tweet = (variables, callback) => {
    tweetMutation({ variables })
      .then(() => {
        callback();
        Alert.success('Successfully tweeted');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const favoriteTweet = variables => {
    favoriteTweetMutation({ variables }).catch(e => {
      Alert.error(e.message);
    });
  };

  const updatedProps = {
    ...props,
    replyTweet,
    favoriteTweet,
    retweet,
    tweet,
    currentConversationId
  };

  return <TwitterMessage {...updatedProps} />;
};

TwitterMessageContainer.propTypes = {
  replyTweetMutation: PropTypes.func,
  favoriteTweetMutation: PropTypes.func,
  currentConversationId: PropTypes.string,
  retweetMutation: PropTypes.func,
  tweetMutation: PropTypes.func
};

export default compose(
  graphql(gql(mutations.favoriteTweet), {
    name: 'favoriteTweetMutation',
    options: ({ currentConversationId }) => {
      return {
        refetchQueries: [
          {
            query: gql`${queries.conversationDetail}`,
            variables: { _id: currentConversationId }
          }
        ]
      };
    }
  }),
  graphql(gql(mutations.retweetTweet), {
    name: 'retweetMutation',
    options: ({ currentConversationId }) => {
      return {
        refetchQueries: [
          {
            query: gql`${queries.conversationDetail}`,
            variables: { _id: currentConversationId }
          }
        ]
      };
    }
  }),
  graphql(gql(mutations.conversationMessageAdd), {
    name: 'replyTweetMutation'
  }),
  graphql(gql(mutations.tweet), { name: 'tweetMutation' })
)(TwitterMessageContainer);

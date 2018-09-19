import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { TwitterMessage } from 'modules/inbox/components/conversationDetail';
import { mutations, queries } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ITwitterResponse } from '../../types';

type Props = {
  replyTweetMutation: (doc: { variables: ITwitterResponse }) => Promise<any>, 
  favoriteTweetMutation: (variables: any) => Promise<any>,
  currentConversationId: string,
  retweetMutation: (doc: { variables: ITwitterResponse }) => Promise<any>,
  tweetMutation: (doc: { variables: ITwitterResponse }) => Promise<any>,
};

const TwitterMessageContainer = (props: Props) => {
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


export default compose(
  graphql(gql(mutations.favoriteTweet), {
    name: 'favoriteTweetMutation',
    options: ({ currentConversationId }: { currentConversationId : string }) => {
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
    options: ({ currentConversationId }: { currentConversationId : string }) => {
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

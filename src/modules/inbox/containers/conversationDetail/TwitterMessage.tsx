import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { TwitterMessage } from 'modules/inbox/components/conversationDetail';
import { mutations, queries } from 'modules/inbox/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import {
  AddMessageMutationVariables,
  FavoriteTweetMutationResponse,
  FavoriteTweetMutationVariables,
  IMessage,
  ReplyTweetMutationResponse,
  RetweetMutationResponse,
  RetweetMutationVariables,
  TweetMutationResponse,
  TweetMutationVariables
} from '../../types';

type Props = {
  currentConversationId: string;
  scrollBottom: () => void;
  message: IMessage;
  integrationId: string;
};

type FinalProps = Props &
  ReplyTweetMutationResponse &
  FavoriteTweetMutationResponse &
  RetweetMutationResponse &
  TweetMutationResponse;

const TwitterMessageContainer = (props: FinalProps) => {
  const {
    replyTweetMutation,
    favoriteTweetMutation,
    tweetMutation,
    retweetMutation,
    currentConversationId
  } = props;

  const replyTweet = (variables: AddMessageMutationVariables, callback) => {
    replyTweetMutation({ variables })
      .then(() => {
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const retweet = (
    variables: {
      integrationId: string;
      id: string;
    },
    callback
  ) => {
    retweetMutation({ variables })
      .then(() => {
        callback();
        Alert.success(`You successfully retweeted`);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const tweet = (
    variables: {
      integrationId: string;
      text: string;
    },
    callback
  ) => {
    tweetMutation({ variables })
      .then(() => {
        callback();
        Alert.success(`You successfully tweeted`);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const favoriteTweet = (variables: { integrationId: string; id: string }) => {
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

export default withProps<Props>(
  compose(
    graphql<
      Props,
      FavoriteTweetMutationResponse,
      FavoriteTweetMutationVariables
    >(gql(mutations.favoriteTweet), {
      name: 'favoriteTweetMutation',
      options: ({ currentConversationId }) => {
        return {
          refetchQueries: [
            {
              query: gql`
                ${queries.conversationDetail}
              `,
              variables: { _id: currentConversationId }
            }
          ]
        };
      }
    }),
    graphql<Props, RetweetMutationResponse, RetweetMutationVariables>(
      gql(mutations.retweetTweet),
      {
        name: 'retweetMutation',
        options: ({ currentConversationId }) => {
          return {
            refetchQueries: [
              {
                query: gql`
                  ${queries.conversationDetail}
                `,
                variables: { _id: currentConversationId }
              }
            ]
          };
        }
      }
    ),
    graphql<Props, ReplyTweetMutationResponse, AddMessageMutationVariables>(
      gql(mutations.conversationMessageAdd),
      {
        name: 'replyTweetMutation'
      }
    ),
    graphql<Props, TweetMutationResponse, TweetMutationVariables>(
      gql(mutations.tweet),
      { name: 'tweetMutation' }
    )
  )(TwitterMessageContainer)
);

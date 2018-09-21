import gql from "graphql-tag";
import { Alert } from "modules/common/utils";
import { TwitterMessage } from "modules/inbox/components/conversationDetail";
import { mutations, queries } from "modules/inbox/graphql";
import * as React from "react";
import { compose, graphql } from "react-apollo";
import { IMessage } from "../../types";
import { IAddMessage } from "./WorkArea";

type Props = {
  replyTweetMutation: (
    doc: {
      variables: IAddMessage;
    }
  ) => Promise<any>;

  favoriteTweetMutation: (
    doc: { variables: { integrationId: string; id: string } }
  ) => Promise<any>;

  currentConversationId: string;

  retweetMutation: (
    doc: {
      variables: {
        integrationId: string;
        id: string;
      };
    }
  ) => Promise<any>;

  tweetMutation: (
    doc: {
      variables: {
        integrationId: string;
        text: string;
      };
    }
  ) => Promise<any>;
  scrollBottom: () => void;
  message: IMessage;
  integrationId: string;
};

const TwitterMessageContainer = (props: Props) => {
  const {
    replyTweetMutation,
    favoriteTweetMutation,
    tweetMutation,
    retweetMutation,
    currentConversationId
  } = props;

  const replyTweet = (variables: IAddMessage, callback) => {
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
        Alert.success("Successfully retweeted");
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
        Alert.success("Successfully tweeted");
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

export default compose(
  graphql(gql(mutations.favoriteTweet), {
    name: "favoriteTweetMutation",
    options: ({ currentConversationId }: { currentConversationId: string }) => {
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
    name: "retweetMutation",
    options: ({ currentConversationId }: { currentConversationId: string }) => {
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
    name: "replyTweetMutation"
  }),
  graphql(gql(mutations.tweet), { name: "tweetMutation" })
)(TwitterMessageContainer);

import { Meteor } from 'meteor/meteor';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import gql from 'graphql-tag';


const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: Meteor.settings.public.APOLLO_CLIENT_URL,
  }),
});

export const newMessage = (messageId) => {
  client.mutate({
    mutation: gql`
      mutation simulateInsertMessage($messageId: String) {
        simulateInsertMessage(messageId: $messageId) {
          _id
        }
      }`,

    variables: {
      messageId,
    },
  });
};

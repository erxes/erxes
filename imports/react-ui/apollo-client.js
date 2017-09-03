import { Meteor } from 'meteor/meteor';
import { ApolloClient, createNetworkInterface } from 'react-apollo';

const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: Meteor.settings.public.APOLLO_CLIENT_URL,
  }),
});

export default client;

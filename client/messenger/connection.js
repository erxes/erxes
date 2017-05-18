import gql from 'graphql-tag';
import client from '../apollo-client';

export const connection = {
  settings: {},
  data: {},
  queryVariables: '$integrationId: String!, $customerId: String!',
  queryParams: 'integrationId: $integrationId, customerId: $customerId',
};

export const connect = ({ brandCode, email, name }) =>
  // call connect mutation
  client.mutate({
    mutation: gql`
      mutation connect($brandCode: String!, $email: String!, $name: String) {
        messengerConnect(brandCode: $brandCode, email: $email, name: $name) {
          integrationId,
          messengerData,
          uiOptions,
          customerId,
        }
      }`,

    variables: { brandCode, email, name },
  });

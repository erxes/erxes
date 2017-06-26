import gql from 'graphql-tag';
import client from '../apollo-client';

export const connection = {
  setting: {},
  data: {},
  queryVariables: '$integrationId: String!, $customerId: String!',
  queryParams: 'integrationId: $integrationId, customerId: $customerId',
};

export const connect = ({ brandCode, email, name, isUser, data }) =>
  // call connect mutation
  client.mutate({
    mutation: gql`
      mutation connect($brandCode: String!, $email: String,
        $name: String, $isUser: Boolean, $data: JSON) {

        messengerConnect(brandCode: $brandCode, email: $email,
          name: $name, isUser: $isUser, data: $data) {
          integrationId,
          messengerData,
          uiOptions,
          customerId,
        }
      }`,

    variables: { brandCode, email, name, isUser, data },
  });

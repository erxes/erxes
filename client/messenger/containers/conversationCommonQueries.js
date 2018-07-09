import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { connection } from '../connection';
import graphqlTypes from '../graphql';

const generate = () => {
  return [
    graphql(
      gql(graphqlTypes.messengerSupportersQuery),
      {
        name: 'messengerSupportersQuery',
        options: () => ({
          variables: {
            integrationId: connection.data.integrationId,
          },
          fetchPolicy: 'network-only',
        }),
      },
    ),

    graphql(
      gql(graphqlTypes.isMessengerOnlineQuery),
      {
        name: 'isMessengerOnlineQuery',
        options: () => ({
          variables: {
            integrationId: connection.data.integrationId,
          },
          fetchPolicy: 'network-only',
        }),
      },
    )
  ]
}

export default generate;

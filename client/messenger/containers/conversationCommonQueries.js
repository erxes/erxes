import { gql, graphql } from 'react-apollo';
import { connection } from '../connection';
import graphqlTypes from './graphql';

const generate = () => {
  return [
    graphql(
      gql(graphqlTypes.conversationLastStaffQuery),
      {
        name: 'conversationLastStaffQuery',
        options: ownProps => ({
          variables: {
            _id: ownProps.conversationId,
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

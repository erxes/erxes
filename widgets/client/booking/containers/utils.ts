import gql from 'graphql-tag';
import client from '../../apollo-client';
import { increaseViewCountMutation } from '../graphql';

/*
 * Increasing view count
 */
export const increaseViewCount = (bookingId: string) => {
  return client.mutate({
    mutation: gql(increaseViewCountMutation),
    variables: {
      _id: bookingId
    }
  });
};

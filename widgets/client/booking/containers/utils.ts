import gql from 'graphql-tag';
import client from '../../apollo-client';
import { requestBrowserInfo } from '../../utils';
import { connection } from '../connection';
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

export const saveBrowserInfo = () => {
  requestBrowserInfo({
    source: 'fromBookings',
    postData: {
      setting: connection.setting
    },
    callback: browserInfo => {
      connection.browserInfo = browserInfo;
    }
  });
};

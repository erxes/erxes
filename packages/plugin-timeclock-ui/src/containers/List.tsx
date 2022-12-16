import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import { TimeClockMutationResponse, TimeClockQueryResponse } from '../types';
import { queries } from '../graphql';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  currentUser: IUser;
  queryParams: any;
  history: any;
  startTime: Date;
  stopTime: Date;
  timeId: string;
  userId: string;
  queryStartDate: string;
  queryEndDate: string;
  queryUserIds: string[];
};

type FinalProps = {
  listQuery: TimeClockQueryResponse;
} & Props &
  TimeClockMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { listQuery, currentUser, queryUserIds } = props;

  if (listQuery.loading) {
    return <Spinner />;
  }

  const currentUserId = currentUser._id;

  const updatedProps = {
    ...props,
    currentUserId,
    queryUserIds,
    timeclocks: listQuery.timeclocks || [],
    loading: listQuery.loading
  };

  return <List {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      TimeClockQueryResponse,
      { startDate: string; endDate: string; userIds: string[] }
    >(gql(queries.list), {
      name: 'listQuery',
      options: ({ queryStartDate, queryEndDate, queryUserIds }) => ({
        variables: {
          startDate: queryStartDate,
          endDate: queryEndDate,
          userIds: queryUserIds
        },
        fetchPolicy: 'network-only'
      })
    })
  )(withCurrentUser(ListContainer))
);

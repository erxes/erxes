import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import { TimeClockMutationResponse, TimeClockQueryResponse } from '../types';
import { mutations, queries } from '../graphql';
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
  queryUserId: string;
};

type FinalProps = {
  listQuery: TimeClockQueryResponse;
} & Props &
  TimeClockMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    listQuery,
    startTimeMutation,
    stopTimeMutation,
    currentUser,
    queryEndDate,
    queryStartDate,
    queryUserId
  } = props;

  if (listQuery.loading) {
    return <Spinner />;
  }

  const currentUserId = queryUserId || currentUser._id;

  const updatedProps = {
    ...props,
    currentUserId,
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
      { startDate: string; endDate: string; userId: string }
    >(gql(queries.list), {
      name: 'listQuery',
      options: ({ queryStartDate, queryEndDate, queryUserId }) => ({
        variables: {
          startDate: queryStartDate,
          endDate: queryEndDate,
          userId: queryUserId
        },
        fetchPolicy: 'network-only'
      })
    })
  )(withCurrentUser(ListContainer))
);

import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, confirm, router, withProps } from '@erxes/ui/src/utils';
import List from '../components/List';
import { TimeClockMutationResponse, TimeClockQueryResponse } from '../types';
import { mutations, queries } from '../graphql';
import React, { useState } from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import SelectWithSearch from '@erxes/ui/src/components/SelectWithSearch';

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
    history,
    queryEndDate,
    queryStartDate,
    queryUserId
  } = props;

  if (listQuery.loading) {
    return <Spinner />;
  }

  const currentUserId = queryUserId || currentUser._id;

  const startClockTime = (currentTime: Date, userId: string) => {
    startTimeMutation({
      variables: { time: currentTime, userId: `${userId}` }
    })
      .then(() => {
        // setShiftStarted(true);
        localStorage.setItem('shiftStarted', 'true');
        Alert.success('Successfully clocked in');
      })
      .catch(err => Alert.error(err.message));
  };

  const stopClockTime = (
    currentTime: Date,
    userId: string,
    timeId?: string
  ) => {
    stopTimeMutation({
      variables: {
        _id: timeId,
        time: currentTime,
        userId: `${userId}`
      }
    })
      .then(() => {
        localStorage.setItem('shiftStarted', '');
        Alert.success('Successfully clocked out');
      })
      .catch(err => Alert.error(err.message));
  };

  const updatedProps = {
    ...props,
    currentUserId,
    timeclocks: listQuery.timeclocks || [],
    startClockTime,
    stopClockTime,
    // shiftStarted,
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
    }),

    graphql<Props, TimeClockMutationResponse, { time: Date; userId: string }>(
      gql(mutations.clockStart),
      {
        name: 'startTimeMutation',
        options: ({ startTime, userId }) => ({
          variables: { time: startTime, userId: `${userId}` },
          refetchQueries: ['listQuery']
        })
      }
    ),

    graphql<
      Props,
      TimeClockMutationResponse,
      { time: Date; userId: string; _id: string }
    >(gql(mutations.clockStop), {
      name: 'stopTimeMutation',
      options: ({ stopTime, userId, timeId }) => ({
        variables: { time: stopTime, userId: `${userId}`, _id: timeId },
        refetchQueries: ['listQuery']
      })
    })
  )(withCurrentUser(ListContainer))
);

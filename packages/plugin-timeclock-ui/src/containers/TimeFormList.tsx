import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, withProps } from '@erxes/ui/src/utils';
import TimeForm from '../components/TimeForm';
import { TimeClockMutationResponse, BranchesQueryResponse } from '../types';
import { mutations } from '../graphql';
import React from 'react';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import { ITimeclock } from '../types';

type Props = {
  timeclocks: ITimeclock[];
  searchValue: string;
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
  shiftId: string;
  shiftStarted: boolean;
  departmendIds: string[];
  branchIds: string[];
};

type FinalProps = {} & Props & TimeClockMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    timeclocks,
    startTimeMutation,
    stopTimeMutation,
    currentUser,
    queryUserId,
    shiftId,
    shiftStarted
  } = props;

  const currentUserId = queryUserId || currentUser._id;

  const startClockTime = (userId: string) => {
    startTimeMutation({
      variables: { userId: `${userId}` }
    })
      .then(() => {
        // setShiftStarted(true);
        localStorage.setItem('shiftStarted', 'true');
        Alert.success('Successfully clocked in');
      })
      .catch(err => Alert.error(err.message));
  };

  const stopClockTime = (userId: string, timeId?: string) => {
    stopTimeMutation({
      variables: {
        _id: timeId,
        userId: `${userId}`
      }
    })
      .then(() => {
        Alert.success('Successfully clocked out');
      })
      .catch(err => Alert.error(err.message));
  };

  const updatedProps = {
    ...props,
    currentUserId,
    timeclocks,
    shiftStarted,
    shiftId,
    startClockTime,
    stopClockTime
  };
  return <TimeForm {...updatedProps} currentUserId={currentUserId} />;
};

export default withProps<Props>(
  compose(
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

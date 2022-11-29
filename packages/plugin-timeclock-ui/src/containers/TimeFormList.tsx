import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, withProps } from '@erxes/ui/src/utils';
import TimeForm from '../components/TimeForm';
import { TimeClockMutationResponse, TimeClockQueryResponse } from '../types';
import { mutations } from '../graphql';
import React from 'react';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { IUser } from '@erxes/ui/src/auth/types';
import { ITimeclock } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';

type Props = {
  timeclocks: ITimeclock[];
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

type FinalProps = {} & Props & TimeClockMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    timeclocks,
    startTimeMutation,
    stopTimeMutation,
    currentUser,
    queryUserId
  } = props;

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
    timeclocks,
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

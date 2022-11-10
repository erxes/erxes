import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import ScheduleList from '../components/ScheduleList';
import {
  IShift,
  ScheduleMutationResponse,
  ScheduleQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';

type Props = {
  history: any;
  queryParams: any;
  explanation: string;
  userId: string;
  userIds: string[];
  reason: string;
  startTime: Date;
  endTime: Date;
  scheduleId: string;
  scheduleStatus: string;
  shiftId: string;
  shiftStatus: string;
  requestedShifts: IShift[];
  queryStartDate: Date;
  queryEndDate: Date;
  queryUserId: string;
};

type FinalProps = {
  listScheduleQuery: ScheduleQueryResponse;
} & Props &
  ScheduleMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    queryParams,
    sendScheduleReqMutation,
    submitShiftMutation,
    solveScheduleMutation,
    solveShiftMutation,
    listScheduleQuery
  } = props;

  const { userId } = queryParams;

  // if (listScheduleQuery.loading) {
  //   return <Spinner />;
  // }

  const solveSchedule = (scheduleId: string, status: string) => {
    solveScheduleMutation({
      variables: { _id: scheduleId, status: `${status}` }
    });
  };

  const solveShift = (shiftId: string, status: string) => {
    solveShiftMutation({
      variables: { _id: shiftId, status: `${status}` }
    });
  };

  const submitRequest = (
    selectedUserId: string[],
    requestedShifts: IShift[]
  ) => {
    console.log(selectedUserId);

    sendScheduleReqMutation({
      variables: {
        userId: `${selectedUserId}`,
        shifts: requestedShifts
      }
    })
      .then(() => Alert.success('Successfully sent a schedule request'))
      .catch(err => Alert.error(err.message));
  };

  const submitShift = (
    selectedUserIds: string[],
    requestedShifts: IShift[]
  ) => {
    submitShiftMutation({
      variables: {
        userIds: selectedUserIds,
        shifts: requestedShifts
      }
    })
      .then(() => Alert.success('Successfully sent a schedule request'))
      .catch(err => Alert.error(err.message));
  };
  console.log('awawawa', listScheduleQuery.schedules);

  const updatedProps = {
    ...props,
    scheduleOfMembers: listScheduleQuery.schedules,
    loading: listScheduleQuery.loading,
    solveSchedule,
    solveShift,
    submitRequest,
    submitShift
  };
  return <ScheduleList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ScheduleQueryResponse, { userId: string }>(
      gql(queries.listSchedule),
      {
        name: 'listScheduleQuery',
        options: ({ queryUserId }) => ({
          variables: {
            // startDate: queryStartDate,
            // endDate: queryEndDate,
            userId: queryUserId
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ScheduleMutationResponse>(
      gql(mutations.sendScheduleRequest),
      {
        name: 'sendScheduleReqMutation',
        options: ({ userId, requestedShifts }) => ({
          variables: {
            userId: `${userId}`,
            shifts: requestedShifts
          },
          refetchQueries: ['listScheduleQuery']
        })
      }
    ),
    graphql<Props, ScheduleMutationResponse>(gql(mutations.submitShift), {
      name: 'submitShiftMutation',
      options: ({ userIds, requestedShifts }) => ({
        variables: {
          userIds: `${userIds}`,
          shifts: `${requestedShifts}`
        },
        refetchQueries: ['listScheduleQuery']
      })
    }),
    graphql<Props, ScheduleMutationResponse>(gql(mutations.solveSchedule), {
      name: 'solveScheduleMutation',
      options: ({ scheduleId, scheduleStatus }) => ({
        variables: {
          _id: scheduleId,
          status: scheduleStatus
        },
        refetchQueries: ['listScheduleQuery']
      })
    }),

    graphql<Props, ScheduleMutationResponse>(gql(mutations.solveShift), {
      name: 'solveShiftMutation',
      options: ({ shiftId, shiftStatus }) => ({
        variables: {
          _id: shiftId,
          status: shiftStatus
        },
        refetchQueries: ['listScheduleQuery']
      })
    })
  )(ListContainer)
);

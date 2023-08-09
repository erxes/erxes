import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import ScheduleList from '../../components/schedule/ScheduleList';
import {
  BranchesQueryResponse,
  ISchedule,
  IScheduleConfig,
  IShift,
  ScheduleMutationResponse,
  ScheduleQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import Spinner from '@erxes/ui/src/components/Spinner';
import { dateFormat, timeFormat } from '../../constants';
import * as dayjs from 'dayjs';
import { AlertContainer } from '../../styles';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  currentUser: IUser;

  isCurrentUserAdmin: boolean;
  isCurrentUserSupervisor?: boolean;

  branches: IBranch[];
  departments: IDepartment[];

  history: any;
  queryParams: any;

  userId?: string;
  userIds?: string[];

  scheduleId?: string;
  scheduleStatus?: string;

  shiftId?: string;
  shiftStatus?: string;

  requestedShifts?: IShift[];
  scheduleConfigs: IScheduleConfig[];

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

type FinalProps = {
  listSchedulesMain: ScheduleQueryResponse;
  listBranchesQuery: BranchesQueryResponse;
} & Props &
  ScheduleMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    sendScheduleReqMutation,
    submitScheduleMutation,
    solveScheduleMutation,
    solveShiftMutation,
    removeScheduleMutation,
    removeScheduleShiftMutation,
    checkDuplicateScheduleShiftsMutation,
    listSchedulesMain
  } = props;

  if (listSchedulesMain.loading) {
    return <Spinner />;
  }
  const solveSchedule = (scheduleId: string, status: string) => {
    solveScheduleMutation({
      variables: { _id: scheduleId, status: `${status}` }
    })
      .then(() => {
        Alert.success('Successfully solved a schedule request');
      })
      .catch(err => Alert.error(err.message));
  };

  const solveShift = (shiftId: string, status: string) => {
    solveShiftMutation({
      variables: { _id: shiftId, status: `${status}` }
    });
  };

  const submitRequest = (variables: any) => {
    const userId = `${variables.userIds}`;
    sendScheduleReqMutation({
      variables: {
        userId,
        ...variables
      }
    })
      .then(() => {
        Alert.success('Successfully sent a schedule request');
        variables.closeModal();
      })
      .catch(err => Alert.error(err.message));
  };

  const submitSchedule = (variables: any) => {
    submitScheduleMutation({ variables })
      .then(() => {
        Alert.success('Successfully submitted schedule');
        variables.closeModal();
      })
      .catch(err => Alert.error(err.message));
  };

  const removeScheduleShifts = (scheduleId, type) => {
    confirm(`Are you sure to remove schedule ${type}`).then(() => {
      (type === 'shift'
        ? removeScheduleShiftMutation({ variables: { _id: scheduleId } })
        : removeScheduleMutation({ variables: { _id: scheduleId } })
      ).then(() => Alert.success(`Successfully removed schedule ${type}`));
    });
  };

  const checkInput = (variables: {
    branchIds: string[];
    departmentIds: string[];
    userIds: string[];
    shifts: IShift[];
    totalBreakInMins?: number | string;
    scheduleConfigId?: string;
    closeModal: () => void;
  }) => {
    const { branchIds, departmentIds, userIds, shifts } = variables;

    if (
      (!branchIds || !branchIds.length) &&
      (!departmentIds || !departmentIds.length) &&
      !userIds.length
    ) {
      Alert.error('No users were given');
    } else if (shifts.length === 0) {
      Alert.error('No shifts were given');
    } else {
      return true;
    }
  };

  const checkDuplicateScheduleShifts = (variables: any) => {
    const { userType } = variables;
    let duplicateSchedules: ISchedule[] = [];

    checkDuplicateScheduleShiftsMutation({
      variables
    })
      .then(res => {
        duplicateSchedules = res.data.checkDuplicateScheduleShifts;
        if (!duplicateSchedules.length) {
          Alert.success('No duplicate schedules');
          if (checkInput(variables)) {
            userType === 'admin'
              ? submitSchedule(variables)
              : submitRequest(variables);
          }
        }

        const usersWithDuplicateShifts: {
          [userId: string]: { userInfo: string; shiftInfo: string[] };
        } = {};

        for (const duplicateSchedule of duplicateSchedules) {
          const { user } = duplicateSchedule;
          const { details } = user;

          const getUserInfo =
            user && details && details.fullName
              ? details.fullName
              : user.email || user.employeeId;

          const duplicateShifts: string[] = [];

          for (const shift of duplicateSchedule.shifts) {
            const shiftDay = dayjs(shift.shiftStart).format(dateFormat);
            const shiftStart = dayjs(shift.shiftStart).format(timeFormat);
            const shiftEnd = dayjs(shift.shiftEnd).format(timeFormat);
            const shiftRequest = duplicateSchedule.solved ? '' : '(Request)';

            duplicateShifts.push(
              `${shiftRequest} ${shiftDay} ${shiftStart} ~ ${shiftEnd}`
            );
          }

          usersWithDuplicateShifts[user._id] = {
            userInfo: getUserInfo || '-',
            shiftInfo: duplicateShifts
          };
        }

        const alertMessages: any = [];
        for (const userId of Object.keys(usersWithDuplicateShifts)) {
          const displayDuplicateShifts = usersWithDuplicateShifts[
            userId
          ].shiftInfo.join('\n');

          const displayUserInfo = usersWithDuplicateShifts[userId].userInfo;

          alertMessages.push(
            (Alert.error(
              `${displayUserInfo} has duplicate schedule:\n${displayDuplicateShifts}`
            ),
            200000)
          );
        }

        return (
          <AlertContainer>
            <>{alertMessages.map(alertMessage => alertMessage)}</>
          </AlertContainer>
        );
      })
      .catch(err => Alert.error(err.message));

    return duplicateSchedules;
  };

  const { list = [], totalCount = 0 } = listSchedulesMain.schedulesMain || [];

  const updatedProps = {
    ...props,
    scheduleOfMembers: list,
    totalCount,
    loading: listSchedulesMain.loading,
    solveSchedule,
    solveShift,
    submitRequest,
    submitSchedule,
    removeScheduleShifts,
    checkDuplicateScheduleShifts
  };

  return <ScheduleList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ScheduleQueryResponse>(gql(queries.schedulesMain), {
      name: 'listSchedulesMain',
      options: ({ queryParams, isCurrentUserAdmin }) => ({
        variables: {
          ...generatePaginationParams(queryParams || {}),
          isCurrentUserAdmin,
          startDate: queryParams.startDate,
          endDate: queryParams.endDate,
          userIds: queryParams.userIds,
          departmentIds: queryParams.departmentIds,
          branchIds: queryParams.branchIds,
          scheduleStatus: queryParams.scheduleStatus
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, ScheduleMutationResponse>(
      gql(mutations.sendScheduleRequest),
      {
        name: 'sendScheduleReqMutation',
        options: ({ userId, requestedShifts }) => ({
          variables: {
            userId,
            shifts: requestedShifts
          },
          refetchQueries: ['schedulesMain']
        })
      }
    ),
    graphql<Props, ScheduleMutationResponse>(gql(mutations.submitSchedule), {
      name: 'submitScheduleMutation',
      options: ({ userIds, requestedShifts }) => ({
        variables: {
          userIds,
          shifts: `${requestedShifts}`
        },
        refetchQueries: ['schedulesMain']
      })
    }),
    graphql<Props, ScheduleMutationResponse>(gql(mutations.solveSchedule), {
      name: 'solveScheduleMutation',
      options: ({ scheduleId, scheduleStatus }) => ({
        variables: {
          _id: scheduleId,
          status: scheduleStatus
        },
        refetchQueries: ['schedulesMain']
      })
    }),

    graphql<Props, ScheduleMutationResponse>(gql(mutations.solveShift), {
      name: 'solveShiftMutation',
      options: ({ shiftId, shiftStatus }) => ({
        variables: {
          _id: shiftId,
          status: shiftStatus
        },
        refetchQueries: ['schedulesMain']
      })
    }),
    graphql<Props, ScheduleMutationResponse>(gql(mutations.scheduleRemove), {
      name: 'removeScheduleMutation',
      options: ({ scheduleId }) => ({
        variables: {
          _id: scheduleId
        },
        refetchQueries: ['schedulesMain']
      })
    }),

    graphql<Props, ScheduleMutationResponse>(
      gql(mutations.scheduleShiftRemove),
      {
        name: 'removeScheduleShiftMutation',
        options: ({ shiftId }) => ({
          variables: {
            _id: shiftId
          },
          refetchQueries: ['schedulesMain']
        })
      }
    ),

    graphql<Props, ScheduleMutationResponse>(
      gql(mutations.checkDuplicateScheduleShifts),
      {
        name: 'checkDuplicateScheduleShiftsMutation'
      }
    )
  )(ListContainer)
);

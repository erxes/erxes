import {
  AbsenceMutationResponse,
  IAbsence,
  TimeClockMutationResponse,
  TimeClockQueryResponse,
  TimeLogsPerUserQueryResponse
} from '../../types';
import { Alert, withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { mutations, queries } from '../../graphql';
import CheckInOutForm from '../../components/absence/CheckInOutForm';
import React from 'react';
import { TimeClockPerUserQueryResponse } from '../../types';

type Props = {
  userId: string;
  startDate?: string;
  endDate?: string;

  absenceRequest: IAbsence;

  timeType: string;
  timeclockId?: string;
  timeclockStart?: Date;
  timeclockEnd?: Date;
  timeclockActive?: boolean;

  checkType?: string;
  contentProps: any;

  shiftStart?: Date;
  shiftEnd?: Date;
  shiftActive?: boolean;

  absenceId?: string;
  status?: string;
};

type FinalProps = {
  listTimeLogsPerUser: TimeLogsPerUserQueryResponse;
  listTimeclocksPerUser: TimeClockPerUserQueryResponse;
} & Props &
  TimeClockMutationResponse &
  AbsenceMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    listTimeLogsPerUser,
    listTimeclocksPerUser,
    timeclockEditMutation,
    timeclockCreateMutation,
    solveAbsenceMutation
  } = props;

  const editTimeclock = values => {
    timeclockEditMutation({ variables: values })
      .then(() => Alert.success('Successfully edited time clock'))
      .catch(err => Alert.error(err.message));
  };

  const createTimeclock = values => {
    timeclockCreateMutation({ variables: values })
      .then(() => Alert.success('Successfully created time clock'))
      .catch(err => Alert.error(err.message));
  };

  const solveAbsence = values => {
    solveAbsenceMutation({ variables: values }).catch(err =>
      Alert.error(err.message)
    );
  };

  const updatedProps = {
    ...props,
    createTimeclock,
    editTimeclock,
    solveAbsence,
    timelogsPerUser: listTimeLogsPerUser.timeLogsPerUser || [],
    timeclocksPerUser: listTimeclocksPerUser.timeclocksPerUser || []
  };

  return <CheckInOutForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, TimeClockQueryResponse>(gql(queries.timeclocksPerUser), {
      name: 'listTimeclocksPerUser',
      options: ({ userId, startDate, endDate }) => ({
        variables: { userId, startDate, endDate },
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, TimeClockQueryResponse>(gql(queries.timeLogsPerUser), {
      name: 'listTimeLogsPerUser',
      options: ({ userId, startDate, endDate }) => ({
        variables: { userId, startDate, endDate },
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, TimeClockQueryResponse>(gql(mutations.timeclockEdit), {
      name: 'timeclockEditMutation',
      options: ({ timeclockId, shiftStart, shiftEnd, shiftActive }) => ({
        variables: { _id: timeclockId, shiftStart, shiftEnd, shiftActive },
        refetchQueries: ['timeclocksMain']
      })
    }),

    graphql<Props, TimeClockQueryResponse>(gql(mutations.timeclockCreate), {
      name: 'timeclockCreateMutation',
      options: ({ userId, shiftStart, shiftEnd, shiftActive }) => ({
        variables: { userId, shiftStart, shiftEnd, shiftActive },
        refetchQueries: ['timeclocksMain']
      })
    }),

    graphql<Props, AbsenceMutationResponse>(
      gql(mutations.solveAbsenceRequest),
      {
        name: 'solveAbsenceMutation',
        options: ({ absenceId, status }) => ({
          variables: {
            _id: absenceId,
            status
          },
          refetchQueries: ['requestsMain']
        })
      }
    )
  )(ListContainer)
);

import {
  AbsenceMutationResponse,
  IAbsence,
  TimeClockMutationResponse,
  TimeClockQueryResponse,
  TimeLogsPerUserQueryResponse
} from '../../types';
import { Alert, withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
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

    graphql<Props, TimeClockQueryResponse>(gql(mutations.timeclockEdit), {
      name: 'timeclockEditMutation',
      options: () => ({
        refetchQueries: ['timeclocksMain']
      })
    }),

    graphql<Props, TimeClockQueryResponse>(gql(mutations.timeclockCreate), {
      name: 'timeclockCreateMutation'
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

import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import AbsenceList from '../components/AbsenceList';
import {
  AbsenceMutationResponse,
  AbsenceQueryResponse,
  AbsenceTypeQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';
import { IAttachment } from '@erxes/ui/src/types';

type Props = {
  history: any;
  queryParams: any;
  explanation: string;
  userId: string;
  reason: string;
  startTime: Date;
  endTime: Date;
  absenceId: string;
  absenceStatus: string;
  attachment: IAttachment;
  queryStartDate: Date;
  queryEndDate: Date;
  queryUserId: string;
};

type FinalProps = {
  listAbsenceQuery: AbsenceQueryResponse;
  listAbsenceTypesQuery: AbsenceTypeQueryResponse;
} & Props &
  AbsenceMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    queryParams,
    sendAbsenceReqMutation,
    solveAbsenceMutation,
    listAbsenceQuery,
    listAbsenceTypesQuery
  } = props;
  const { startDate, endDate, userId, reason } = queryParams;

  if (listAbsenceQuery.loading) {
    return <Spinner />;
  }

  const solveAbsence = (absenceId: string, status: string) => {
    solveAbsenceMutation({
      variables: { _id: absenceId, status: `${status}` }
    })
      .then(() => Alert.success('Successfully solved absence request'))
      .catch(err => Alert.error(err.message));
  };

  const submitRequest = (expl: string, attchment: IAttachment) => {
    if (!reason || !startDate || !endDate) {
      Alert.error('Please fill all the fields');
    } else {
      sendAbsenceReqMutation({
        variables: {
          startTime: startDate,
          endTime: endDate,
          userId: `${userId}`,
          reason: `${reason}`,
          explanation: expl.length > 0 ? expl : undefined,
          attachment: attchment.url.length > 0 ? attchment : undefined
        }
      })
        .then(() => Alert.success('Successfully sent an absence request'))
        .catch(err => Alert.error(err.message));
    }
  };

  const updatedProps = {
    ...props,
    absences: listAbsenceQuery.absences || [],
    absenceTypes: listAbsenceTypesQuery.absenceTypes || [],
    loading: listAbsenceQuery.loading,
    solveAbsence,
    submitRequest
  };
  return <AbsenceList {...updatedProps} />;
};
export default withProps<Props>(
  compose(
    graphql<
      Props,
      AbsenceQueryResponse,
      { startDate: Date; endDate: Date; userId: string }
    >(gql(queries.listAbsence), {
      name: 'listAbsenceQuery',
      options: ({ queryStartDate, queryEndDate, queryUserId }) => ({
        variables: {
          startDate: queryStartDate,
          endDate: queryEndDate,
          userId: queryUserId
        },
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, AbsenceTypeQueryResponse>(gql(queries.listAbsenceTypes), {
      name: 'listAbsenceTypesQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, AbsenceMutationResponse>(gql(mutations.sendAbsenceRequest), {
      name: 'sendAbsenceReqMutation',
      options: ({
        startTime,
        endTime,
        userId,
        reason,
        explanation,
        attachment
      }) => ({
        variables: {
          startTime: `${startTime}`,
          endTime: `${endTime}`,
          userId: `${userId}`,
          reason: `${reason}`,
          explanation: `${explanation}`,
          attachment: `${attachment}`
        },
        refetchQueries: ['listAbsenceQuery']
      })
    }),

    graphql<Props, AbsenceMutationResponse>(gql(mutations.solveAbsence), {
      name: 'solveAbsenceMutation',
      options: ({ absenceId, absenceStatus }) => ({
        variables: {
          _id: absenceId,
          status: absenceStatus
        },
        refetchQueries: ['listAbsenceQuery']
      })
    })
  )(ListContainer)
);

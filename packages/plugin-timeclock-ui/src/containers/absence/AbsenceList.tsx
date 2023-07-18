import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import AbsenceList from '../../components/absence/AbsenceList';
import {
  AbsenceMutationResponse,
  AbsenceQueryResponse,
  AbsenceTypeQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { IAttachment } from '@erxes/ui/src/types';
import { generateParams } from '../../utils';
import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';

type Props = {
  currentUser: IUser;
  departments: IDepartment[];
  branches: IBranch[];

  isCurrentUserAdmin: boolean;

  history: any;
  queryParams: any;
  explanation?: string;
  userId?: string;
  reason?: string;
  startTime?: Date;
  endTime?: Date;
  absenceId?: string;
  absenceStatus?: string;
  attachment?: IAttachment;

  absenceTypeId?: string;

  checkTime?: Date;
  checkType?: string;

  getActionBar: (actionBar: any) => void;
  getPagination: (pagination: any) => void;
  showSideBar: (sideBar: boolean) => void;
};

type FinalProps = {
  listAbsenceQuery: AbsenceQueryResponse;
  listAbsenceTypesQuery: AbsenceTypeQueryResponse;
} & Props &
  AbsenceMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    sendAbsenceReqMutation,
    solveAbsenceMutation,
    removeAbsenceMutation,

    submitCheckInOutRequestMutation,

    listAbsenceQuery,
    listAbsenceTypesQuery
  } = props;

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

  const removeAbsence = (_id: string) => {
    confirm('Are you sure to remove this request').then(() => {
      removeAbsenceMutation({ variables: { _id } })
        .then(() => Alert.success('Successfully removed absence request'))
        .catch(err => Alert.error(err.message));
    });
  };

  const submitRequest = (
    userId: string,
    reason: string,
    explanation: string,
    attachment: IAttachment,
    submitTime: any,
    absenceTypeId: string,
    absenceTimeType: string,
    totalHoursOfAbsence: string
  ) => {
    const checkAttachment = attachment.url.length ? attachment : undefined;

    if (absenceTimeType === 'by day') {
      const sortedRequestDates = submitTime.requestDates.sort();

      sendAbsenceReqMutation({
        variables: {
          userId,
          requestDates: submitTime.requestDates,
          reason,
          startTime: new Date(sortedRequestDates[0]),
          endTime: new Date(sortedRequestDates.slice(-1)),
          explanation,
          attachment: checkAttachment,
          absenceTypeId,
          absenceTimeType,
          totalHoursOfAbsence
        }
      })
        .then(() => Alert.success('Successfully sent an absence request'))
        .catch(err => Alert.error(err.message));

      return;
    }
    // by time
    sendAbsenceReqMutation({
      variables: {
        userId,
        startTime: submitTime.startTime,
        endTime: submitTime.endTime,
        reason,
        explanation,
        attachment: checkAttachment,
        absenceTypeId,
        absenceTimeType,
        totalHoursOfAbsence
      }
    })
      .then(() => Alert.success('Successfully sent an absence request'))
      .catch(err => Alert.error(err.message));
  };

  const submitCheckInOut = (type: string, userId: string, dateVal: Date) => {
    submitCheckInOutRequestMutation({
      variables: {
        checkType: type,
        checkTime: dateVal
      }
    })
      .then(() => Alert.success(`Successfully sent ${type} request`))
      .catch(err => Alert.error(err.message));
  };

  const { list = [], totalCount = 0 } = listAbsenceQuery.requestsMain || {};

  const updatedProps = {
    ...props,
    totalCount,
    absences: list,
    absenceTypes: listAbsenceTypesQuery.absenceTypes || [],
    loading: listAbsenceQuery.loading,
    solveAbsence,
    removeAbsence,
    submitRequest,
    submitCheckInOut
  };

  return <AbsenceList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, AbsenceQueryResponse>(gql(queries.requestsMain), {
      name: 'listAbsenceQuery',
      options: ({ queryParams, isCurrentUserAdmin }) => ({
        variables: { ...generateParams(queryParams), isCurrentUserAdmin },
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, AbsenceTypeQueryResponse>(gql(queries.absenceTypes), {
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
        attachment,
        absenceTypeId
      }) => ({
        variables: {
          startTime,
          endTime,
          userId,
          reason,
          explanation,
          attachment,
          absenceTypeId
        },
        refetchQueries: ['requestsMain']
      })
    }),

    graphql<Props, AbsenceMutationResponse>(
      gql(mutations.solveAbsenceRequest),
      {
        name: 'solveAbsenceMutation',
        options: ({ absenceId, absenceStatus }) => ({
          variables: {
            _id: absenceId,
            status: absenceStatus
          },
          refetchQueries: ['requestsMain']
        })
      }
    ),

    graphql<Props, AbsenceMutationResponse>(
      gql(mutations.removeAbsenceRequest),
      {
        name: 'removeAbsenceMutation',
        options: ({ absenceId }) => ({
          variables: {
            _id: absenceId
          },
          refetchQueries: ['requestsMain']
        })
      }
    ),

    graphql<Props, AbsenceMutationResponse>(
      gql(mutations.submitCheckInOutRequest),
      {
        name: 'submitCheckInOutRequestMutation',
        options: ({ checkType, userId, checkTime }) => ({
          variables: {
            checkType,
            userId,
            checkTime
          },
          refetchQueries: ['requestsMain', 'timeclocksMain']
        })
      }
    )
  )(ListContainer)
);

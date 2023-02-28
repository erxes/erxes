import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
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
import { Alert } from '@erxes/ui/src/utils';
import { IAttachment } from '@erxes/ui/src/types';
import { generateParams } from '../../utils';

type Props = {
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
    queryParams,
    sendAbsenceReqMutation,
    solveAbsenceMutation,

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

  const submitRequest = (
    usrId: string,
    reason: string,
    expl: string,
    attchment: IAttachment,
    dateRange: any,
    absenceTypeId: string
  ) => {
    if (!reason || !dateRange.startTime || !dateRange.endTime) {
      Alert.error('Please fill all the fields');
    } else {
      sendAbsenceReqMutation({
        variables: {
          userId: usrId,
          startTime: dateRange.startTime,
          endTime: dateRange.endTime,
          reason: `${reason}`,
          explanation: expl.length > 0 ? expl : undefined,
          attachment: attchment.url.length > 0 ? attchment : undefined,
          absenceTypeId: `${absenceTypeId}`
        }
      })
        .then(() => Alert.success('Successfully sent an absence request'))
        .catch(err => Alert.error(err.message));
    }
  };

  const submitCheckInOut = (type: string, userId: string, dateVal: Date) => {
    submitCheckInOutRequestMutation({
      variables: {
        checkType: type,
        userId: `${userId}`,
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
    submitRequest,
    submitCheckInOut
  };

  return <AbsenceList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, AbsenceQueryResponse>(gql(queries.listRequestsMain), {
      name: 'listAbsenceQuery',
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams),
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
        refetchQueries: ['listRequestsMain']
      })
    }),

    graphql<Props, AbsenceMutationResponse>(gql(mutations.solveAbsence), {
      name: 'solveAbsenceMutation',
      options: ({ absenceId, absenceStatus }) => ({
        variables: {
          _id: absenceId,
          status: absenceStatus
        },
        refetchQueries: ['listRequestsMain']
      })
    }),

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
          refetchQueries: ['listRequestsMain', 'listTimeclocksQuery']
        })
      }
    )
  )(ListContainer)
);

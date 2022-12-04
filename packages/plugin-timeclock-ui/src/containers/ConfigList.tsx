import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import ConfigList from '../components/ConfigList';
import { AbsenceMutationResponse, AbsenceQueryResponse } from '../types';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';

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

  queryStartDate: Date;
  queryEndDate: Date;
  queryUserId: string;
};

type FinalProps = {
  listAbsenceQuery: AbsenceQueryResponse;
} & Props &
  AbsenceMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    queryParams,
    sendAbsenceReqMutation,
    solveAbsenceMutation,
    listAbsenceQuery
  } = props;
  const { startDate, endDate, userId, reason } = queryParams;

  // if (listAbsenceQuery.loading) {
  //   return <Spinner />;
  // }

  const solveAbsence = (absenceId: string, status: string) => {
    solveAbsenceMutation({
      variables: { _id: absenceId, status: `${status}` }
    })
      .then(() => Alert.success('Successfully solved absence request'))
      .catch(err => Alert.error(err.message));
  };

  const submitRequest = (expl: string) => {
    sendAbsenceReqMutation({
      variables: {
        startTime: startDate,
        endTime: endDate,
        userId: `${userId}`,
        reason: `${reason}`,
        explanation: expl
      }
    })
      .then(() => Alert.success('Successfully sent an absence request'))
      .catch(err => Alert.error(err.message));
  };
  const updatedProps = {
    ...props,
    solveAbsence,
    submitRequest
  };
  return <ConfigList {...updatedProps} />;
};
export default withProps<Props>(compose()(ListContainer));

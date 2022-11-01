import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import ScheduleList from '../components/ScheduleList';
import {
  ITimeclock,
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
  reason: string;
  startTime: Date;
  endTime: Date;

  queryStartDate: Date;
  queryEndDate: Date;
  queryUserId: string;
};

type FinalProps = {
  listScheduleQuery: ScheduleQueryResponse;
} & Props &
  ScheduleMutationResponse;

const ListContainer = (props: FinalProps) => {
  const { queryParams, sendScheduleReqMutation, listScheduleQuery } = props;
  const { startDate, endDate, userId, reason } = queryParams;

  // if (listScheduleQuery.loading) {
  //   return <Spinner />;
  // }

  const submitRequest = (filledShifts: ITimeclock[]) => {
    sendScheduleReqMutation({
      variables: {
        userId: `${userId}`,
        shiftsOfWeek: filledShifts
      }
    })
      .then(() => Alert.success('Successfully sent a schedule request'))
      .catch(err => Alert.error(err.message));
  };
  const updatedProps = {
    ...props,
    submitRequest
  };
  return <ScheduleList {...updatedProps} />;
};

export default ListContainer;

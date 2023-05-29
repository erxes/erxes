import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { gql } from '@apollo/client';
import React, { useState } from 'react';
import LogsList from '../../components/logs/LogsList';
import { mutations, queries } from '../../graphql';
import {
  TimeLogsQueryResponse,
  ReportsQueryResponse,
  TimeLogMutationResponse
} from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generateParams } from '../../utils';
import { dateFormat } from '../../constants';
import dayjs from 'dayjs';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  history: any;
  queryParams: any;
  searchValue?: string;

  isCurrentUserAdmin: boolean;

  reportType?: string;

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

type FinalProps = {
  listTimelogsQuery: TimeLogsQueryResponse;
} & Props &
  TimeLogMutationResponse;

const ListContainer = (props: FinalProps) => {
  const {
    listTimelogsQuery,
    queryParams,
    extractTimeLogsFromMsSQLMutation,
    createTimeClockFromLogMutation
  } = props;

  const { branchId, deptId } = queryParams;
  const [loading, setLoading] = useState(false);

  if (listTimelogsQuery.loading || loading) {
    return <Spinner />;
  }

  const { list = [], totalCount = 0 } = listTimelogsQuery.timelogsMain;

  const extractTimeLogsFromMsSQL = (start: Date, end: Date) => {
    setLoading(true);
    extractTimeLogsFromMsSQLMutation({
      variables: {
        startDate: dayjs(start).format(dateFormat),
        endDate: dayjs(end).format(dateFormat)
      }
    })
      .then(() => {
        setLoading(false);
        listTimelogsQuery.refetch();
        Alert.success('Successfully extracted time logs');
      })
      .catch(e => {
        setLoading(false);
        Alert.error(e.message);
      });
  };

  const createTimeclockFromLog = (userId: string, timelog: Date) => {
    confirm('Are you sure to create timeclock from the log?').then(() =>
      createTimeClockFromLogMutation({
        variables: { userId, timelog }
      })
        .then(() => Alert.success('Successfully created Timeclock'))
        .catch(e => {
          Alert.error(e.message);
        })
    );
  };

  const updatedProps = {
    ...props,
    extractTimeLogsFromMsSQL,
    createTimeclockFromLog,
    timelogs: list,
    totalCount,
    branchId,
    deptId
  };

  return <LogsList {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ReportsQueryResponse>(gql(queries.timelogsMain), {
      name: 'listTimelogsQuery',
      options: ({ queryParams, reportType, isCurrentUserAdmin }) => ({
        variables: {
          ...generateParams(queryParams),
          isCurrentUserAdmin,
          reportType
        },
        fetchPolicy: 'network-only'
      })
    }),

    graphql<Props, ReportsQueryResponse>(
      gql(mutations.extractTimeLogsFromMsSql),
      {
        name: 'extractTimeLogsFromMsSQLMutation'
      }
    ),

    graphql<Props, ReportsQueryResponse>(
      gql(mutations.createTimeClockFromLog),
      {
        name: 'createTimeClockFromLogMutation'
      }
    )
  )(ListContainer)
);

import * as compose from 'lodash.flowright';

import React from 'react';
import { IOptions, IPipeline } from '../types';
import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import { graphql } from 'react-apollo';
import queries from '../../settings/logs/queries';
import { LogsQueryResponse } from 'modules/settings/logs/types';
import ActivityLogs from '../components/activityLogs/ActivityLogs';
import { generatePaginationParams } from 'modules/common/utils/router';

type Props = {
  pipeline: IPipeline;
  queryParams: any;
  options: IOptions;
};

type WithStagesProps = {
  logsQuery: LogsQueryResponse;
} & Props;

const ActivityLits = (props: WithStagesProps) => {
  const { queryParams, logsQuery } = props;
  const errorMessage = logsQuery.error ? logsQuery.error.message : '';
  const isLoading = logsQuery.loading;

  const updatedProps = {
    ...props,
    isLoading: logsQuery.loading,
    refetchQueries: commonOptions(queryParams),
    logs: isLoading || errorMessage ? [] : logsQuery.logs.logs,
    count: isLoading || errorMessage ? 0 : logsQuery.logs.totalCount,
    errorMessage
  };

  return <ActivityLogs {...updatedProps} />;
};

const commonOptions = queryParams => {
  const variables = {
    start: queryParams.start,
    end: queryParams.end,
    userId: queryParams.userId,
    action: queryParams.action,
    type: queryParams.type,
    ...generatePaginationParams(queryParams)
  };

  return [{ query: gql(queries.logs), variables }];
};

export default withProps<Props>(
  compose(
    graphql<Props, LogsQueryResponse>(gql(queries.logs), {
      name: 'logsQuery',
      options: ({ queryParams }) => ({
        notifyOnNetworkStatusChange: true,
        variables: {
          start: queryParams.start,
          end: queryParams.end,
          userId: queryParams.userId,
          action: queryParams.action,
          type: queryParams.type,
          ...generatePaginationParams(queryParams)
        }
      })
    })
  )(ActivityLits)
);

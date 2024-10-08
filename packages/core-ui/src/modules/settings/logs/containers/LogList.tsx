import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import LogList from '../components/LogList';
import queries from '../queries';
import { LogsQueryResponse } from '../types';

type FinalProps = {
  can: (action: string) => boolean;
} & Props;

const List = (props: FinalProps) => {
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

  return <LogList {...updatedProps} />;
};

type Props = {
  queryParams: Record<string, string>;
  logsQuery: LogsQueryResponse;
};

const commonOptions = queryParams => {
  const variables = {
    start: queryParams.startDate,
    end: queryParams.endDate,
    userId: queryParams.userId,
    action: queryParams.action,
    type: queryParams.type,
    searchValue: queryParams.searchValue,
    ...generatePaginationParams(queryParams)
  };

  return [{ query: gql(queries.logs), variables }];
};

export default compose(
  graphql<Props, LogsQueryResponse>(gql(queries.logs), {
    name: 'logsQuery',
    options: ({ queryParams }) => ({
      notifyOnNetworkStatusChange: true,
      variables: {
        start: queryParams.startDate,
        end: queryParams.endDate,
        userId: queryParams.userId,
        action: queryParams.action,
        type: queryParams.type,
        searchValue: queryParams.searchValue,
        ...generatePaginationParams(queryParams)
      }
    })
  })
)(List);

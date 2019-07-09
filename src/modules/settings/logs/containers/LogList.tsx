import gql from 'graphql-tag';
import { generatePaginationParams } from 'modules/common/utils/router';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import LogList from '../components/LogList';
import queries from '../queries';
import { LogsQueryResponse } from '../types';

type FinalProps = {
  can: (action: string) => boolean;
} & Props;

const List = (props: FinalProps) => {
  const { history, queryParams, usersQuery, logsQuery } = props;

  const isLoading = logsQuery.loading || usersQuery.loading;

  const updatedProps = {
    ...props,
    queryParams,
    history,
    users: usersQuery.users || [],
    isLoading,
    refetchQueries: commonOptions(queryParams),
    logs: isLoading ? [] : logsQuery.logs.logs,
    count: isLoading ? 0 : logsQuery.logs.totalCount
  };

  return <LogList {...updatedProps} />;
};

type Props = {
  history: any;
  queryParams: any;
  usersQuery: UsersQueryResponse;
  logsQuery: LogsQueryResponse;
};

const commonOptions = queryParams => {
  const variables = {
    start: queryParams.start,
    end: queryParams.end,
    userId: queryParams.userId,
    action: queryParams.action,
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
        start: queryParams.start,
        end: queryParams.end,
        userId: queryParams.userId,
        action: queryParams.action,
        ...generatePaginationParams(queryParams)
      }
    })
  }),
  graphql<Props, UsersQueryResponse>(gql(userQueries.users), {
    name: 'usersQuery'
  })
)(List);

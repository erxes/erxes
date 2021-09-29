import * as compose from 'lodash.flowright';

import React from 'react';
import { IPipeline, ActivityLogsByActionQueryResponse } from '../types';
import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import { graphql } from 'react-apollo';
import { generatePaginationParams } from 'modules/common/utils/router';
import { queries } from '../graphql';
import ActivityLogs from '../components/activityLogs/ActivityLogs';

type Props = {
  pipeline: IPipeline;
  queryParams: any;
};

type WithStagesProps = {
  activityLogsByActionQuery: ActivityLogsByActionQueryResponse;
} & Props;

const ActivityLits = (props: WithStagesProps) => {
  const { queryParams, activityLogsByActionQuery } = props;

  const errorMessage = activityLogsByActionQuery.error
    ? activityLogsByActionQuery.error
    : '';

  const isLoading = activityLogsByActionQuery.loading;

  const updatedProps = {
    ...props,
    isLoading: activityLogsByActionQuery.loading,
    refetchQueries: commonOptions(queryParams),
    activityLogsByAction:
      isLoading || errorMessage
        ? []
        : activityLogsByActionQuery.activityLogsByAction,
    count: isLoading || errorMessage ? 0 : activityLogsByActionQuery.totalCount,
    errorMessage
  };

  return <ActivityLogs {...updatedProps} />;
};

const commonOptions = queryParams => {
  const variables = {
    action: queryParams.action,
    contentType: queryParams.contentType,
    ...generatePaginationParams(queryParams)
  };

  return [{ query: gql(queries.activityLogsByAction), variables }];
};

export default withProps<Props>(
  compose(
    graphql<Props, ActivityLogsByActionQueryResponse>(
      gql(queries.activityLogsByAction),
      {
        name: 'activityLogsByActionQuery',
        options: ({ queryParams }) => ({
          variables: {
            action: queryParams.action,
            contentType: 'task'
          }
        })
      }
    )
  )(ActivityLits)
);

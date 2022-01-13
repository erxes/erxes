import * as compose from 'lodash.flowright';

import React from 'react';
import {
  IPipeline,
  ActivityLogsByActionQueryResponse,
  IOptions
} from '../types';
import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import { graphql } from 'react-apollo';
import { generatePaginationParams } from 'modules/common/utils/router';
import { queries } from '../graphql';
import ActivityLogs from '../components/activityLogs/ActivityLogs';

type Props = {
  pipeline: IPipeline;
  queryParams: any;
  options: IOptions;
};

type WithStagesProps = {
  activityLogsByActionQuery: ActivityLogsByActionQueryResponse;
} & Props;

const ActivityLits = (props: WithStagesProps) => {
  const { queryParams, activityLogsByActionQuery } = props;

  const { error, activityLogsByAction, loading } = activityLogsByActionQuery;

  const updatedProps = {
    ...props,
    isLoading: loading,
    refetchQueries: commonOptions(queryParams),
    activityLogsByAction:
      loading || error ? [] : activityLogsByAction.activityLogs,
    count: loading || error ? 0 : activityLogsByAction.totalCount,
    errorMessage: error || ''
  };

  return <ActivityLogs {...updatedProps} />;
};

const commonOptions = queryParams => {
  const variables = {
    action: queryParams.action,
    contentType: queryParams.type,
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
        options: ({ queryParams, options }) => ({
          variables: {
            action: queryParams.action,
            contentType: options.type,
            pipelineId: queryParams.pipelineId,
            page: parseInt(queryParams.page || '1', 10),
            perPage: parseInt(queryParams.perPage || '10', 10)
          }
        })
      }
    )
  )(ActivityLits)
);

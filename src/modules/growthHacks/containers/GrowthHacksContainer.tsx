import gql from 'graphql-tag';
import {
  IFilterParams,
  PipelineDetailQueryResponse
} from 'modules/boards/types';
import { withProps } from 'modules/common/utils';
import WeightedScore from 'modules/growthHacks/components/weightedScore/WeightedScore';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import GrowthHacks from '../components/funnelImpact/GrowthHacks';
import { queries } from '../graphql';

type Props = {
  queryParams: any;
  hackStage?: string;
};

type FinalProps = {
  growthHacksQuery: any;
  pipelineDetailQuery: PipelineDetailQueryResponse;
  growthHacksTotalCountQuery: any;
} & Props;

class GrowthHacksContainer extends React.Component<FinalProps> {
  render() {
    const {
      growthHacksQuery,
      pipelineDetailQuery,
      growthHacksTotalCountQuery,
      hackStage
    } = this.props;

    const { growthHacks = [], loading, refetch } = growthHacksQuery;

    const commonProps = {
      ...this.props,
      growthHacks,
      loading,
      refetch,
      totalCount: growthHacksTotalCountQuery.growthHacksTotalCount
    };

    if (hackStage) {
      return <GrowthHacks {...commonProps} />;
    }

    const pipeline = pipelineDetailQuery.pipelineDetail || {};
    const { hackScoringType = '', bgColor = '' } = pipeline;

    const extendedProps = {
      ...commonProps,
      hackScoringType,
      bgColor
    };

    return <WeightedScore {...extendedProps} />;
  }
}

interface IGrowthHackFilterParams extends IFilterParams {
  pipelineId?: string;
}

const getFilterParams = (queryParams: IGrowthHackFilterParams) => {
  if (!queryParams) {
    return {};
  }

  return {
    pipelineId: queryParams.pipelineId,
    search: queryParams.search,
    assignedUserIds: queryParams.assignedUserIds,
    nextDay: queryParams.nextDay,
    nextWeek: queryParams.nextWeek,
    nextMonth: queryParams.nextMonth,
    noCloseDate: queryParams.noCloseDate,
    overdue: queryParams.overdue
  };
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.growthHacks), {
      name: 'growthHacksQuery',
      options: ({ queryParams = {}, hackStage }) => ({
        variables: {
          ...getFilterParams(queryParams),
          hackStage,
          limit: parseInt(queryParams.limit, 10) || 15,
          sortField: queryParams.sortField,
          sortDirection: parseInt(queryParams.sortDirection, 10)
        }
      })
    }),
    graphql<Props>(gql(queries.pipelineDetail), {
      name: 'pipelineDetailQuery',
      skip: ({ queryParams }) => !queryParams.pipelineId,
      options: ({ queryParams }) => ({
        variables: { _id: queryParams && queryParams.pipelineId }
      })
    }),
    graphql<Props>(gql(queries.growthHacksTotalCount), {
      name: 'growthHacksTotalCountQuery',
      options: ({ queryParams = {}, hackStage }) => ({
        variables: {
          ...getFilterParams(queryParams),
          hackStage
        }
      })
    })
  )(GrowthHacksContainer)
);

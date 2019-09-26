import gql from 'graphql-tag';
import {
  IFilterParams,
  PipelineDetailQueryResponse
} from 'modules/boards/types';
import { withProps } from 'modules/common/utils';
import WeightedScore from 'modules/growthHacks/components/weightedScore/WeightedScore';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';

type Props = {
  queryParams: any;
};

type FinalProps = {
  growthHacksQuery: any;
  pipelineDetailQuery: PipelineDetailQueryResponse;
} & Props;

class WeightedScoreContainer extends React.Component<FinalProps> {
  render() {
    const { growthHacksQuery, pipelineDetailQuery } = this.props;

    const growthHacks = growthHacksQuery.growthHacks || [];
    const pipeline = pipelineDetailQuery.pipelineDetail || {};

    const { hackScoringType = '', bgColor = '' } = pipeline;

    const extendedProps = {
      ...this.props,
      hackScoringType,
      bgColor,
      growthHacks
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
      options: ({ queryParams = {} }) => ({
        variables: {
          ...getFilterParams(queryParams),

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
    })
  )(WeightedScoreContainer)
);

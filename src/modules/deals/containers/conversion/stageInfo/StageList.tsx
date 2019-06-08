import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Spinner } from '../../../../common/components';
import { withProps } from '../../../../common/utils';
import StageList from '../../../components/conversion/stageInfo/StageList';
import { queries } from '../../../graphql';
import { StagesQueryResponse } from '../../../types';
import Stage from '../stageInfoMore/Stage';

type Props = {
  pipelineId: string;
  queryParams: any;
  type: string;
};

type FinalProps = {
  stagesQuery: StagesQueryResponse;
} & Props;

class StageListContainer extends React.Component<FinalProps> {
  render() {
    const { stagesQuery, queryParams, type } = this.props;

    if (stagesQuery.loading) {
      return <Spinner objective={true} />;
    }

    const stages = stagesQuery.dealStages || [];

    if (type === 'more') {
      const contents = stages.map(stage => (
        <Stage
          key={stage._id}
          stage={stage}
          deals={stage.deals || []}
          queryParams={queryParams}
        />
      ));
      return <div>{contents}</div>;
    }
    return <StageList stages={stages} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, StagesQueryResponse>(gql(queries.stages), {
      name: 'stagesQuery',
      options: ({ pipelineId, queryParams }) => ({
        variables: {
          type: 'notLost',
          pipelineId,
          search: queryParams.search,
          customerIds: queryParams.customerIds,
          companyIds: queryParams.companyIds,
          assignedUserIds: queryParams.assignedUserIds,
          productIds: queryParams.productIds,
          nextDay: queryParams.nextDay,
          nextWeek: queryParams.nextWeek,
          nextMonth: queryParams.nextMonth,
          noCloseDate: queryParams.noCloseDate,
          overdue: queryParams.overdue
        }
      })
    })
  )(StageListContainer)
);

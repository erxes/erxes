import gql from 'graphql-tag';
// import { StageList } from '../../../components/conversion';
// import { StageList as StageListWithDeals } from '../../../components/conversion/stageInfoMore';
import { queries } from 'modules/boards/graphql';
import { StagesQueryResponse } from 'modules/boards/types';
import { Spinner } from 'modules/common/components';
import { withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  pipelineId: string;
  queryParams: any;
  type: string;
};

type FinalProps = {
  stagesQuery: StagesQueryResponse;
} & Props;

class DealStagesContainer extends React.Component<FinalProps> {
  render() {
    const { stagesQuery, type } = this.props;

    if (stagesQuery.loading) {
      return <Spinner objective={true} />;
    }

    // const stages = stagesQuery.dealStages || [];

    if (type === 'more') {
      return <div>sdads</div>;
    }

    return <div>sdads</div>;
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
  )(DealStagesContainer)
);

import gql from 'graphql-tag';
import { queries } from 'modules/boards/graphql';
import { StagesQueryResponse } from 'modules/boards/types';
import { Spinner } from 'modules/common/components';
import { withProps } from 'modules/common/utils';
import List from 'modules/deals/components/conversion/list/List';
import Table from 'modules/deals/components/conversion/table/Table';
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
    const { stagesQuery, type, pipelineId } = this.props;
    if (localStorage.getItem('cacheInvalidated') === 'true') {
      stagesQuery.refetch({ pipelineId });
    }

    if (stagesQuery.loading) {
      return <Spinner objective={true} />;
    }

    const stages = stagesQuery.stages || [];

    if (type === 'more') {
      return <Table {...this.props} stages={stages} />;
    }

    return <List stages={stages} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, StagesQueryResponse>(gql(queries.stages), {
      name: 'stagesQuery',
      options: ({ pipelineId, queryParams }) => ({
        variables: {
          isNotLost: true,
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

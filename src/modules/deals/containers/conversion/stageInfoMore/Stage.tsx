import client from 'apolloClient';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { __, Alert, withProps } from 'modules/common/utils';
import Stage from 'modules/deals/components/conversion/stageInfoMore/Stage';
import { queries } from 'modules/deals/graphql';
import { DealsQueryResponse, IDeal, IStage } from 'modules/deals/types';
import { IQueryParams } from 'modules/insights/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  stage: IStage;
  deals: IDeal[];
  queryParams: IQueryParams;
  pipelineId: string;
};

type FinalStageProps = {
  dealsQuery: DealsQueryResponse;
} & Props;

type State = {
  loadingDeals: boolean;
};

class StageContainer extends React.PureComponent<FinalStageProps, State> {
  constructor(props) {
    super(props);

    this.state = { loadingDeals: false };
  }

  loadMore = () => {
    const { stage, dealsQuery, queryParams } = this.props;

    const deals = dealsQuery.deals;

    const loading = dealsQuery.loading || dealsQuery.loading;
    const hasMore = stage.dealsTotalCount > deals.length;

    if (deals.length === stage.dealsTotalCount) {
      return;
    }
    if (!loading && hasMore) {
      this.setState({ loadingDeals: true });

      dealsQuery.fetchMore({
        variables: {
          stageId: stage._id,
          skip: deals.length,
          ...getFilterParams(queryParams)
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          this.setState({ loadingDeals: false });

          if (!fetchMoreResult) {
            return prev;
          }

          const prevDeals = prev.deals || [];
          const prevDealIds = prevDeals.map(m => m._id);
          const fetchedDeals: IDeal[] = [];

          for (const deal of fetchMoreResult.deals) {
            if (!prevDealIds.includes(deal._id)) {
              fetchedDeals.push(deal);
            }
          }
          return {
            ...prev,
            deals: [...fetchedDeals, ...prevDeals]
          };
        }
      });
    }
  };
  render() {
    const { stage, dealsQuery } = this.props;
    const { loadingDeals } = this.state;

    if (dealsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const deals = dealsQuery.deals;

    return (
      <Stage
        stage={stage}
        deals={deals}
        loadMore={this.loadMore}
        loadingDeals={loadingDeals}
      />
    );
  }
}

const getFilterParams = queryParams => {
  if (!queryParams) {
    return {};
  }

  return {
    search: queryParams.search,
    customerIds: queryParams.customerIds,
    companyIds: queryParams.companyIds,
    assignedUserIds: queryParams.assignedUserIds,
    nextDay: queryParams.nextDay,
    nextWeek: queryParams.nextWeek,
    nextMonth: queryParams.nextMonth,
    noCloseDate: queryParams.noCloseDate,
    overdue: queryParams.overdue,
    productIds: queryParams.productIds
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, DealsQueryResponse>(gql(queries.deals), {
      name: 'dealsQuery',
      options: ({ pipelineId, stage, queryParams }) => ({
        variables: {
          stageId: stage._id,
          pipelineId,
          type: 'primary',
          ...getFilterParams(queryParams)
        }
      })
    })
  )(StageContainer)
);

import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IConversionStage } from 'modules/boards/types';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import Stage from 'modules/deals/components/conversion/table/Stage';
import { queries } from 'modules/deals/graphql';
import { DealsQueryResponse, IDeal } from 'modules/deals/types';
import { IQueryParams } from 'modules/insights/types';
import * as React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  stage: IConversionStage;
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

    this.state = {
      loadingDeals: false
    };
  }

  loadMore = () => {
    const { stage, dealsQuery, queryParams } = this.props;

    const deals = dealsQuery.deals || [];
    const loading = dealsQuery.loading || dealsQuery.loading;
    const hasMore = stage.initialDealsTotalCount > deals.length;

    if (deals.length === stage.initialDealsTotalCount) {
      return;
    }

    if (!loading && hasMore) {
      this.setState({ loadingDeals: true });

      dealsQuery.fetchMore({
        variables: {
          initialStageId: stage._id,
          skip: deals.length,
          ...getFilterParams(queryParams)
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          this.setState({ loadingDeals: false });

          if (!fetchMoreResult) {
            return prev;
          }

          const prevDeals = prev.deals || [];
          const prevDealIds = prevDeals.map((deal: IDeal) => deal._id);
          const fetchedDeals: IDeal[] = [];

          for (const deal of fetchMoreResult.deals) {
            if (!prevDealIds.includes(deal._id)) {
              fetchedDeals.push(deal);
            }
          }

          return {
            ...prev,
            deals: [...prevDeals, ...fetchedDeals]
          };
        }
      });
    }
  };

  render() {
    const { stage, dealsQuery } = this.props;
    const { loadingDeals } = this.state;

    if (localStorage.getItem('cacheInvalidated') === 'true') {
      localStorage.setItem('cacheInvalidated', 'false');

      dealsQuery.refetch();
    }

    if (dealsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const deals = dealsQuery.deals;

    if (!deals) {
      return <EmptyState text="Deals not found" icon="piggy-bank" />;
    }

    const hasMore = stage.initialDealsTotalCount > deals.length;

    return (
      <Stage
        hasMore={hasMore}
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
    closeDateType: queryParams.closeDateType,
    productIds: queryParams.productIds,
    labelIds: queryParams.labelIds,
    userIds: queryParams.userIds
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, DealsQueryResponse>(gql(queries.deals), {
      name: 'dealsQuery',
      options: ({ pipelineId, stage, queryParams }) => ({
        variables: {
          initialStageId: stage._id,
          pipelineId,
          ...getFilterParams(queryParams)
        }
      })
    })
  )(StageContainer)
);

import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IConversionStage } from '@erxes/ui-cards/src/boards/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import Stage from '../../components/conversion/table/Stage';
import { queries } from '@erxes/ui-cards/src/deals/graphql';
import {
  DealsQueryResponse,
  IDeal,
  IQueryParams
} from '@erxes/ui-cards/src/deals/types';
import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';

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
    userIds: queryParams.userIds,
    assignedToMe: queryParams.assignedToMe
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

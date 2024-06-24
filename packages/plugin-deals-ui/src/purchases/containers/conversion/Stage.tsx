import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IConversionStagePurchase } from '@erxes/ui-cards/src/boards/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import Stage from '../../components/conversion/table/Stage';
import { queries } from '@erxes/ui-cards/src/purchases/graphql';
import {
  PurchasesQueryResponse,
  IPurchase,
  IQueryParams
} from '@erxes/ui-cards/src/purchases/types';
import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  stage: IConversionStagePurchase;
  queryParams: IQueryParams;
  pipelineId: string;
};

type FinalStageProps = {
  purchasesQuery: PurchasesQueryResponse;
} & Props;

type State = {
  loadingPurchases: boolean;
};

class StageContainer extends React.PureComponent<FinalStageProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      loadingPurchases: false
    };
  }

  loadMore = () => {
    const { stage, purchasesQuery, queryParams } = this.props;

    const purchases = purchasesQuery.purchases || [];
    const loading = purchasesQuery.loading || purchasesQuery.loading;
    const hasMore = stage.initialPurchasesTotalCount > purchases.length;

    if (purchases.length === stage.initialPurchasesTotalCount) {
      return;
    }

    if (!loading && hasMore) {
      this.setState({ loadingPurchases: true });

      purchasesQuery.fetchMore({
        variables: {
          initialStageId: stage._id,
          skip: purchases.length,
          ...getFilterParams(queryParams)
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          this.setState({ loadingPurchases: false });

          if (!fetchMoreResult) {
            return prev;
          }

          const prevPurchases = prev.purchases || [];
          const prevPurchaseIds = prevPurchases.map(
            (purchase: IPurchase) => purchase._id
          );
          const fetchedPurchases: IPurchase[] = [];

          for (const purchase of fetchMoreResult.purchases) {
            if (!prevPurchaseIds.includes(purchase._id)) {
              fetchedPurchases.push(purchase);
            }
          }

          return {
            ...prev,
            purchases: [...prevPurchases, ...fetchedPurchases]
          };
        }
      });
    }
  };

  render() {
    const { stage, purchasesQuery } = this.props;
    const { loadingPurchases } = this.state;

    if (localStorage.getItem('cacheInvalidated') === 'true') {
      localStorage.setItem('cacheInvalidated', 'false');

      purchasesQuery.refetch();
    }

    if (purchasesQuery.loading) {
      return <Spinner objective={true} />;
    }

    const purchases = purchasesQuery.purchases;

    if (!purchases) {
      return <EmptyState text="Purchases not found" icon="piggy-bank" />;
    }

    const hasMore = stage.initialPurchasesTotalCount > purchases.length;

    return (
      <Stage
        hasMore={hasMore}
        stage={stage}
        purchases={purchases}
        loadMore={this.loadMore}
        loadingPurchases={loadingPurchases}
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
    graphql<Props, PurchasesQueryResponse>(gql(queries.purchases), {
      name: 'purchasesQuery',
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

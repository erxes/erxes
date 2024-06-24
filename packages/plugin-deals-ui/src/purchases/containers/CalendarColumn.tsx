import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import {
  ColumnProps,
  getCommonParams
} from '@erxes/ui-cards/src/boards/components/Calendar';
import {
  calendarColumnQuery,
  onCalendarLoadMore
} from '@erxes/ui-cards/src/boards/utils';
import { IDateColumn } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import { getMonthTitle } from '@erxes/ui/src/utils/calendar';
import CalendarColumn from '../components/CalendarColumn';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '@erxes/ui-cards/src/purchases/graphql';
import {
  PurchasesQueryResponse,
  PurchasesTotalAmountsQueryResponse,
  PurchasesTotalCountQueryResponse
} from '@erxes/ui-cards/src/purchases/types';

type FinalProps = ColumnProps & {
  purchasesQuery: PurchasesQueryResponse;
  purchasesTotalCountQuery: PurchasesTotalCountQueryResponse;
  purchasesTotalAmountsQuery: PurchasesTotalAmountsQueryResponse;
};

class PurchaseColumnContainer extends React.Component<FinalProps> {
  componentWillReceiveProps(nextProps: FinalProps) {
    const {
      updatedAt,
      purchasesQuery,
      purchasesTotalCountQuery,
      purchasesTotalAmountsQuery
    } = this.props;

    if (updatedAt !== nextProps.updatedAt) {
      purchasesQuery.refetch();
      purchasesTotalCountQuery.refetch();
      purchasesTotalAmountsQuery.refetch();
    }
  }

  render() {
    const {
      purchasesQuery,
      purchasesTotalCountQuery,
      purchasesTotalAmountsQuery,
      date: { month }
    } = this.props;

    const { fetchMore } = purchasesQuery;

    // Update calendar after stage updated
    if (localStorage.getItem('cacheInvalidated') === 'true') {
      localStorage.setItem('cacheInvalidated', 'false');

      purchasesQuery.refetch();
      purchasesTotalCountQuery.refetch();
      purchasesTotalAmountsQuery.refetch();
    }

    const title = getMonthTitle(month);
    const purchases = purchasesQuery.purchases || [];
    const totalCount = purchasesTotalCountQuery.purchasesTotalCount || 0;
    const purchaseTotalAmounts =
      purchasesTotalAmountsQuery.purchasesTotalAmounts || [];

    const onLoadMore = (skip: number) => {
      return onCalendarLoadMore(fetchMore, 'purchases', skip);
    };

    const updatedProps = {
      ...this.props,
      purchases,
      totalCount,
      title,
      onLoadMore,
      purchaseTotalAmounts
    };

    return <CalendarColumn {...updatedProps} />;
  }
}

export default withProps<ColumnProps>(
  compose(
    calendarColumnQuery(queries.purchases, 'purchasesQuery'),
    calendarColumnQuery(
      queries.purchasesTotalCount,
      'purchasesTotalCountQuery'
    ),
    graphql<
      ColumnProps,
      PurchasesTotalAmountsQueryResponse,
      { date: IDateColumn }
    >(gql(queries.purchasesTotalAmounts), {
      name: 'purchasesTotalAmountsQuery',
      options: ({ date, pipelineId, queryParams }: ColumnProps) => ({
        variables: {
          date,
          pipelineId,
          ...getCommonParams(queryParams)
        }
      })
    })
  )(PurchaseColumnContainer)
);

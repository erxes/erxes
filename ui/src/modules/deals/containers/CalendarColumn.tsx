import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import {
  ColumnProps,
  getCommonParams
} from 'modules/boards/components/Calendar';
import { calendarColumnQuery, onCalendarLoadMore } from 'modules/boards/utils';
import { IDateColumn } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { getMonthTitle } from 'modules/common/utils/calendar';
import CalendarColumn from 'modules/deals/components/CalendarColumn';
import React from 'react';
import { graphql } from 'react-apollo';
import { queries } from '../graphql';
import {
  DealsQueryResponse,
  DealsTotalAmountsQueryResponse,
  DealsTotalCountQueryResponse
} from '../types';

type FinalProps = ColumnProps & {
  dealsQuery: DealsQueryResponse;
  dealsTotalCountQuery: DealsTotalCountQueryResponse;
  dealsTotalAmountsQuery: DealsTotalAmountsQueryResponse;
};

class DealColumnContainer extends React.Component<FinalProps> {
  componentWillReceiveProps(nextProps: FinalProps) {
    const {
      updatedAt,
      dealsQuery,
      dealsTotalCountQuery,
      dealsTotalAmountsQuery
    } = this.props;

    if (updatedAt !== nextProps.updatedAt) {
      dealsQuery.refetch();
      dealsTotalCountQuery.refetch();
      dealsTotalAmountsQuery.refetch();
    }
  }

  render() {
    const {
      dealsQuery,
      dealsTotalCountQuery,
      dealsTotalAmountsQuery,
      date: { month }
    } = this.props;

    const { fetchMore } = dealsQuery;

    // Update calendar after stage updated
    if (localStorage.getItem('cacheInvalidated') === 'true') {
      localStorage.setItem('cacheInvalidated', 'false');

      dealsQuery.refetch();
      dealsTotalCountQuery.refetch();
      dealsTotalAmountsQuery.refetch();
    }

    const title = getMonthTitle(month);
    const deals = dealsQuery.deals || [];
    const totalCount = dealsTotalCountQuery.dealsTotalCount || 0;
    const dealTotalAmounts = dealsTotalAmountsQuery.dealsTotalAmounts || [];

    const onLoadMore = (skip: number) => {
      return onCalendarLoadMore(fetchMore, 'deals', skip);
    };

    const updatedProps = {
      ...this.props,
      deals,
      totalCount,
      title,
      onLoadMore,
      dealTotalAmounts
    };

    return <CalendarColumn {...updatedProps} />;
  }
}

export default withProps<ColumnProps>(
  compose(
    calendarColumnQuery(queries.deals, 'dealsQuery'),
    calendarColumnQuery(queries.dealsTotalCount, 'dealsTotalCountQuery'),
    graphql<ColumnProps, DealsTotalAmountsQueryResponse, { date: IDateColumn }>(
      gql(queries.dealsTotalAmounts),
      {
        name: 'dealsTotalAmountsQuery',
        options: ({ date, pipelineId, queryParams }: ColumnProps) => ({
          variables: {
            date,
            pipelineId,
            ...getCommonParams(queryParams)
          }
        })
      }
    )
  )(DealColumnContainer)
);

import gql from 'graphql-tag';
import { IDateColumn } from 'modules/common/types';
import { getMonthTitle } from 'modules/common/utils/calendar';
import { DealColumn } from 'modules/deals/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';
import { DealsQueryResponse } from '../../types';

type Props = {
  date: IDateColumn;
  dealsQuery: DealsQueryResponse;
};

const DealColumnContainer = props => {
  const {
    dealsQuery,
    dealsTotalAmountsQuery,
    date: { month }
  } = props;
  const { fetchMore } = dealsQuery;

  const title = getMonthTitle(month);
  const deals = dealsQuery.deals || [];
  const dealTotalAmounts = dealsTotalAmountsQuery.dealsTotalAmounts || {
    dealCount: 0,
    dealAmounts: []
  };

  const onLoadMore = (skip: number) => {
    fetchMore({
      variables: { skip },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.deals.length === 0) {
          return prevResult;
        }

        return {
          deals: prevResult.deals.concat(fetchMoreResult.deals)
        };
      }
    });
  };

  const updatedProps = {
    ...props,
    deals,
    title,
    onLoadMore,
    dealTotalAmounts
  };

  return <DealColumn {...updatedProps} />;
};

export default compose(
  graphql<Props>(gql(queries.deals), {
    name: 'dealsQuery',
    options: ({ date }) => ({
      notifyOnNetworkStatusChange: true,
      variables: { skip: 0, date }
    })
  }),
  graphql<Props>(gql(queries.dealsTotalAmounts), {
    name: 'dealsTotalAmountsQuery',
    options: ({ date }) => ({
      variables: { date }
    })
  })
)(DealColumnContainer);

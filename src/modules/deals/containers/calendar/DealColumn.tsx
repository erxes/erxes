import gql from 'graphql-tag';
import { IDateColumn } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import { getMonthTitle, getMonthYear } from 'modules/common/utils/calendar';
import { DealColumn } from 'modules/deals/components';
import * as moment from 'moment';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { queries } from '../../graphql';
import {
  DealsQueryResponse,
  DealsTotalAmountsQueryResponse,
  IDeal
} from '../../types';

type FinalProps = Props & {
  dealsQuery: DealsQueryResponse;
  dealsTotalAmountsQuery: DealsTotalAmountsQueryResponse;
};

class DealColumnContainer extends React.Component<FinalProps> {
  componentWillReceiveProps(nextProps: FinalProps) {
    const { updatedAt, dealsQuery, dealsTotalAmountsQuery } = this.props;

    if (updatedAt !== nextProps.updatedAt) {
      dealsQuery.refetch();
      dealsTotalAmountsQuery.refetch();
    }
  }

  render() {
    const {
      dealsQuery,
      dealsTotalAmountsQuery,
      date: { month }
    } = this.props;

    const { fetchMore } = dealsQuery;

    // Update calendar after stage updated
    if (localStorage.getItem('dealCalendarCacheInvalidated') === 'true') {
      localStorage.setItem('dealCalendarCacheInvalidated', 'false');

      dealsQuery.refetch();
      dealsTotalAmountsQuery.refetch();
    }

    const title = getMonthTitle(month);
    const deals = dealsQuery.deals || [];
    const dealTotalAmounts = dealsTotalAmountsQuery.dealsTotalAmounts || {
      dealCount: 0,
      dealAmounts: []
    };

    const updateDeals = (deal?: IDeal) => {
      dealsQuery.refetch();
      dealsTotalAmountsQuery.refetch();

      if (deal) {
        const { onColumnUpdated } = this.props;

        const convertedDate = moment(deal.closeDate);
        const date = getMonthYear(convertedDate);

        onColumnUpdated(date);
      }
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
      ...this.props,
      deals,
      title,
      onLoadMore,
      onRemove: updateDeals,
      onUpdate: updateDeals,
      dealTotalAmounts
    };

    return <DealColumn {...updatedProps} />;
  }
}

type Props = {
  updatedAt: string;
  pipelineId: string;
  date: IDateColumn;
  queryParams: any;
  onColumnUpdated: (date: IDateColumn) => void;
};

const getCommonParams = queryParams => {
  if (!queryParams) {
    return {};
  }

  return {
    customerIds: queryParams.customerIds,
    companyIds: queryParams.companyIds,
    assignedUserIds: queryParams.assignedUserIds,
    productIds: queryParams.productIds
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, DealsQueryResponse, { skip: number; date: IDateColumn }>(
      gql(queries.deals),
      {
        name: 'dealsQuery',
        options: ({ date, pipelineId, queryParams }: Props) => {
          return {
            notifyOnNetworkStatusChange: true,
            variables: {
              skip: 0,
              date,
              pipelineId,
              ...getCommonParams(queryParams)
            }
          };
        }
      }
    ),
    graphql<Props, DealsTotalAmountsQueryResponse, { date: IDateColumn }>(
      gql(queries.dealsTotalAmounts),
      {
        name: 'dealsTotalAmountsQuery',
        options: ({ date, pipelineId, queryParams }: Props) => ({
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

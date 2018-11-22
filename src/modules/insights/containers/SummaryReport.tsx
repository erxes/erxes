import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { SummaryReport } from '../components';
import { queries } from '../graphql';
import { IParamsWithType, IQueryParams, SummaryQueryResponse } from '../types';

type Props = {
  history: any;
  brandsQuery: BrandsQueryResponse;
  summaryQuery: SummaryQueryResponse;
  queryParams: IQueryParams;
};

const SummaryReportContainer = (props: Props) => {
  const { history, brandsQuery, queryParams, summaryQuery } = props;

  const data = summaryQuery.insightsConversation || {};

  const extendedProps = {
    history,
    queryParams,
    trend: data.trend || [],
    brands: brandsQuery.brands || [],
    summary: data.summary || [],
    loading: summaryQuery.loading
  };

  return <SummaryReport {...extendedProps} />;
};

export default compose(
  graphql(gql(queries.responseSummary), {
    name: 'summaryQuery',
    options: ({ queryParams, type }: IParamsWithType) => ({
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      variables: {
        brandId: queryParams.brandId,
        integrationType: queryParams.integrationType,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate
      }
    })
  }),
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  })
)(SummaryReportContainer);

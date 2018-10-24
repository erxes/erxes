import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { FirstResponse, ResponseCloseReport } from '../components';
import { queries } from '../graphql';
import { IParamsWithType } from '../types';

type Props = {
  queryParams: any;
  history: any;
  type: string;
};

type FinalProps = {
  firstResponseQuery: any;
  responseCloseQuery: any;
  brandsQuery: BrandsQueryResponse;
} & Props;

const FirstAndCloseResponseReportContainer = (props: FinalProps) => {
  const {
    type,
    brandsQuery,
    history,
    firstResponseQuery,
    responseCloseQuery,
    queryParams
  } = props;

  let data;
  let loading;

  if (type === 'close') {
    data = responseCloseQuery.insightsResponseClose || {};
    loading = responseCloseQuery.loading;
  } else {
    data = firstResponseQuery.insightsFirstResponse || {};
    loading = firstResponseQuery.loading;
  }

  const extendedProps = {
    history,
    queryParams,
    trend: data.trend || [],
    time: data.time,
    teamMembers: data.teamMembers || [],
    brands: brandsQuery.brands || [],
    isLoading: brandsQuery.loading || loading,
    summaries: data.summaries || []
  };

  if (type === 'close') {
    return <ResponseCloseReport {...extendedProps} />;
  }

  return <FirstResponse {...extendedProps} />;
};

const commonOptions = (queryParams, skip) => ({
  skip,
  fetchPolicy: 'network-only',
  notifyOnNetworkStatusChange: true,
  variables: {
    brandId: queryParams.brandId,
    integrationType: queryParams.integrationType,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate
  }
});

export default compose(
  graphql(gql(queries.firstResponse), {
    name: 'firstResponseQuery',
    options: ({ queryParams, type }: IParamsWithType) =>
      commonOptions(queryParams, type !== 'first')
  }),
  graphql(gql(queries.responseClose), {
    name: 'responseCloseQuery',
    options: ({ queryParams, type }: IParamsWithType) =>
      commonOptions(queryParams, type !== 'close')
  }),
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  })
)(FirstAndCloseResponseReportContainer);

import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { FirstResponse, ResponseCloseReport } from '../components';
import { queries } from '../graphql';
import {
  FirstResponseQueryResponse,
  IParamsWithType,
  ResponseCloseQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type: string;
};

type FinalProps = {
  firstResponseQuery: FirstResponseQueryResponse;
  responseCloseQuery: ResponseCloseQueryResponse;
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

const commonOptions = queryParams => ({
  fetchPolicy: 'network-only',
  notifyOnNetworkStatusChange: true,
  variables: {
    brandIds: queryParams.brandIds,
    integrationIds: queryParams.integrationIds,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate
  }
});

export default compose(
  graphql(gql(queries.firstResponse), {
    name: 'firstResponseQuery',
    skip: ({ type }) => type !== 'first',
    options: ({ queryParams }: IParamsWithType) => commonOptions(queryParams)
  }),
  graphql(gql(queries.responseClose), {
    name: 'responseCloseQuery',
    skip: ({ type }) => type !== 'close',
    options: ({ queryParams }: IParamsWithType) => commonOptions(queryParams)
  }),
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  })
)(FirstAndCloseResponseReportContainer);

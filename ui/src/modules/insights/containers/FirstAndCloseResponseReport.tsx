import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import FirstResponse from '../components/FirstResponse';
import ResponseCloseReport from '../components/ResponseCloseReport';
import { queries } from '../graphql';
import {
  FirstResponseQueryResponse,
  IParams,
  IQueryParams,
  ResponseCloseQueryResponse
} from '../types';

type Props = {
  queryParams: IQueryParams;
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
    options: ({ queryParams }: IParams) => commonOptions(queryParams)
  }),
  graphql(gql(queries.responseClose), {
    name: 'responseCloseQuery',
    skip: ({ type }) => type !== 'close',
    options: ({ queryParams }: IParams) => commonOptions(queryParams)
  }),
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  })
)(FirstAndCloseResponseReportContainer);

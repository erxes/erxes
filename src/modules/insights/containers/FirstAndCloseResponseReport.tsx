import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { FirstResponse, ResponseCloseReport } from '../components';
import { queries } from '../graphql';
import { IParamsWithType } from '../types';

interface IProps {
  queryParams: any;
  brandsQuery: any;
  history: any;
  responseCloseQuery: any;
  type: string;
  firstResponseQuery: any;
}

const FirstAndCloseResponseReportContainer = (props: IProps) => {
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
    brands: brandsQuery.brands || [],
    history,
    isLoading: brandsQuery.loading || loading,
    queryParams,
    teamMembers: data.teamMembers || [],
    time: data.time,
    trend: data.trend || []
  };

  if (type === 'close') {
    return <ResponseCloseReport {...extendedProps} />;
  }

  return <FirstResponse {...extendedProps} />;
};

const commonOptions = (queryParams, skip) => ({
  fetchPolicy: 'network-only',
  notifyOnNetworkStatusChange: true,
  skip,
  variables: {
    brandId: queryParams.brandId,
    endDate: queryParams.endDate,
    integrationType: queryParams.integrationType,
    startDate: queryParams.startDate
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
  graphql(gql(queries.brands), { name: 'brandsQuery' })
)(FirstAndCloseResponseReportContainer);

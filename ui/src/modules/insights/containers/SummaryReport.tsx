import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React from 'react';
import { BrandsQueryResponse } from '../../settings/brands/types';
import SummaryReport from '../components/SummaryReport';
import { queries } from '../graphql';
import { IQueryParams, SummaryQueryResponse } from '../types';

type Props = {
  history: any;
  queryParams: IQueryParams;
};

export default (props: Props) => {
  const { history, queryParams } = props;

  const {
    loading: summaryQueryLoading,
    error: summaryQueryError,
    data: summaryQueryData
  } = useQuery<SummaryQueryResponse, IQueryParams>(
    gql(queries.responseSummary),
    {
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      variables: queryParams
    }
  );

  const {
    loading: brandsQueryLoading,
    error: brandsQueryError,
    data: brandsQueryData
  } = useQuery<BrandsQueryResponse>(gql(queries.brands));

  if (summaryQueryError || brandsQueryError) {
    return <p>Error!</p>;
  }

  if (summaryQueryLoading || brandsQueryLoading) {
    return <p>Loading...</p>;
  }

  const data = summaryQueryData && summaryQueryData.insightsConversation;

  const extendedProps = {
    history,
    queryParams,
    trend: (data && data.trend) || [],
    brands: (brandsQueryData && brandsQueryData.brands) || [],
    summary: (data && data.summary) || [],
    loading: summaryQueryLoading
  };

  return <SummaryReport {...extendedProps} />;
};

import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { ResponseReport, VolumeReport } from '../components';
import { queries } from '../graphql';
import { IParams, IParamsWithType } from '../types';

type Props = {
  history: any;
  type: string;

  queryParams: any;
};

type FinalProps = {
  volumePieChartQuery: any;
  brandsQuery: BrandsQueryResponse;
  punchCardQuery: any;
  mainQuery: any;
} & Props;

const VolumenAndResponseReportContainer = (props: FinalProps) => {
  const {
    type,
    volumePieChartQuery,
    brandsQuery,
    history,
    punchCardQuery,
    mainQuery,
    queryParams
  } = props;

  const data = mainQuery.insightsMain || {};

  const extendedProps = {
    history,
    queryParams,
    trend: data.trend || [],
    brands: brandsQuery.brands || [],
    punch: punchCardQuery.insightsPunchCard || [],
    summary: data.summary || [],
    loading: {
      main: mainQuery.loading,
      punch: punchCardQuery.loading,
      insights: volumePieChartQuery && volumePieChartQuery.loading
    }
  };

  if (type === 'volume') {
    const volumeProps = {
      ...extendedProps,
      insights: volumePieChartQuery.insights || {}
    };

    return <VolumeReport {...volumeProps} />;
  }

  const responseProps = {
    ...extendedProps,
    teamMembers: data.teamMembers || []
  };

  return <ResponseReport {...responseProps} />;
};

export default compose(
  graphql(gql(queries.pieChart), {
    name: 'volumePieChartQuery',
    skip: ({ type }) => type === 'response',
    options: ({ queryParams }: IParams) => ({
      fetchPolicy: 'network-only',
      variables: {
        brandId: queryParams.brandId,
        integrationType: queryParams.integrationType,
        endDate: queryParams.endDate,
        startDate: queryParams.startDate
      }
    })
  }),
  graphql(gql(queries.punchCard), {
    name: 'punchCardQuery',
    options: ({ queryParams, type }: IParamsWithType) => ({
      fetchPolicy: 'network-only',
      variables: {
        type,
        brandId: queryParams.brandId,
        integrationType: queryParams.integrationType,
        endDate: queryParams.endDate
      }
    })
  }),
  graphql(gql(queries.main), {
    name: 'mainQuery',
    options: ({ queryParams, type }: IParamsWithType) => ({
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      variables: {
        type,
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
)(VolumenAndResponseReportContainer);

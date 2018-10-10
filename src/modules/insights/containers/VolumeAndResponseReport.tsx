import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ResponseReport, VolumeReport } from '../components';
import { queries } from '../graphql';
import { IParams, IParamsWithType } from '../types';

interface IProps {
  history: any;
  type: string;
  volumePieChartQuery: any;
  brandsQuery: any;
  punchCardQuery: any;
  mainQuery: any;
  queryParams: any;
}

const VolumenAndResponseReportContainer = (props: IProps) => {
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
    brands: brandsQuery.brands || [],
    history,
    loading: {
      insights: volumePieChartQuery && volumePieChartQuery.loading,
      main: mainQuery.loading,
      punch: punchCardQuery.loading
    },
    punch: punchCardQuery.insightsPunchCard || [],
    queryParams,
    summary: data.summary || [],
    trend: data.trend || []
  };

  if (type === 'volume') {
    const volumeProps = {
      ...extendedProps,
      insights: volumePieChartQuery.insights || []
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
    options: ({ queryParams }: IParams) => ({
      fetchPolicy: 'network-only',
      variables: {
        brandId: queryParams.brandId,
        endDate: queryParams.endDate,
        startDate: queryParams.startDate
      }
    }),
    skip: ({ type }) => type === 'response'
  }),
  graphql(gql(queries.punchCard), {
    name: 'punchCardQuery',
    options: ({ queryParams, type }: IParamsWithType) => ({
      fetchPolicy: 'network-only',
      variables: {
        brandId: queryParams.brandId,
        endDate: queryParams.endDate,
        integrationType: queryParams.integrationType,
        type
      }
    })
  }),
  graphql(gql(queries.main), {
    name: 'mainQuery',
    options: ({ queryParams, type }: IParamsWithType) => ({
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      variables: {
        brandId: queryParams.brandId,
        endDate: queryParams.endDate,
        integrationType: queryParams.integrationType,
        startDate: queryParams.startDate,
        type
      }
    })
  }),
  graphql(gql(queries.brands), { name: 'brandsQuery' })
)(VolumenAndResponseReportContainer);

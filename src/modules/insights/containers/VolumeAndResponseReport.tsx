import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ResponseReport, VolumeReport } from '../components';
import { queries } from '../graphql';
import { IParams, IParamsWithType } from '../types'

interface IProps {
  history: any,
  type: string,
  volumePieChartQuery: any,
  brandsQuery: any,
  punchCardQuery: any,
  mainQuery: any,
  queryParams: any
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
    skip: ({ type }) => type === 'response',
    options: ({ queryParams }: IParams) => ({
      fetchPolicy: 'network-only',
      variables: {
        brandId: queryParams.brandId,
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
  graphql(gql(queries.brands), { name: 'brandsQuery' })
)(VolumenAndResponseReportContainer);

import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { ResponseReport, VolumeReport } from '../components';
import { queries } from '../graphql';
import {
  IntegrationChartQueryResponse,
  IParams,
  IQueryParams,
  PunchCardQueryResponse,
  SummaryDataQueryResponse,
  TagChartQueryResponse,
  TrendQueryResponse
} from '../types';

type Props = {
  history: any;
  type: string;
  queryParams: IQueryParams;
};

type FinalProps = {
  volumeIntegrationChartQuery: IntegrationChartQueryResponse;
  volumeTagChartQuery: TagChartQueryResponse;
  brandsQuery: BrandsQueryResponse;
  punchCardQuery: PunchCardQueryResponse;
  trendQuery: TrendQueryResponse;
  summaryDataQuery: SummaryDataQueryResponse;
} & Props;

const VolumenAndResponseReportContainer = (props: FinalProps) => {
  const {
    type,
    volumeIntegrationChartQuery,
    volumeTagChartQuery,
    brandsQuery,
    history,
    punchCardQuery,
    trendQuery,
    summaryDataQuery,
    queryParams
  } = props;

  const trend = trendQuery.insightsTrend || [];
  const summary = summaryDataQuery.insightsSummaryData || [];

  const extendedProps = {
    history,
    queryParams,
    trend,
    brands: brandsQuery.brands || [],
    punch: punchCardQuery.insightsPunchCard || [],
    summary,
    loading: {
      trend: trendQuery.loading,
      summary: summaryDataQuery.loading,
      punch: punchCardQuery.loading,
      integrations:
        volumeIntegrationChartQuery && volumeIntegrationChartQuery.loading,
      tags: volumeTagChartQuery && volumeTagChartQuery.loading
    }
  };

  if (type === 'volume') {
    const volumeProps = {
      ...extendedProps,
      integrations: volumeIntegrationChartQuery.insightsIntegrations || [],
      tags: volumeTagChartQuery.insightsTags || []
    };

    return <VolumeReport {...volumeProps} />;
  }

  return <ResponseReport {...extendedProps} />;
};

const options = ({ queryParams, type }: IParams) => ({
  fetchPolicy: 'network-only',
  notifyOnNetworkStatusChange: true,
  variables: {
    type,
    brandIds: queryParams.brandIds,
    integrationIds: queryParams.integrationIds,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate
  }
});

export default compose(
  graphql(gql(queries.integrationChart), {
    name: 'volumeIntegrationChartQuery',
    skip: ({ type }) => type === 'response',
    options
  }),
  graphql(gql(queries.tagChart), {
    name: 'volumeTagChartQuery',
    skip: ({ type }) => type === 'response',
    options
  }),
  graphql(gql(queries.punchCard), {
    name: 'punchCardQuery',
    options
  }),
  graphql(gql(queries.trend), {
    name: 'trendQuery',
    options
  }),
  graphql(gql(queries.summaryData), {
    name: 'summaryDataQuery',
    options
  }),
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  })
)(VolumenAndResponseReportContainer);

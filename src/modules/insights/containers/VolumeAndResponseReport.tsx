import client from 'apolloClient';
import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { ResponseReport, VolumeReport } from '../components';
import { queries } from '../graphql';
import {
  IChartParams,
  IPieChartData,
  IPunchCardData,
  IQueryParams,
  SummaryData
} from '../types';

type Props = {
  history: any;
  type: string;
  queryParams: IQueryParams;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
} & Props;

type State = {
  summaryData: SummaryData[];
  trend: IChartParams[];
  punchCard: IPunchCardData[];
  integrationChart: IPieChartData[];
  tagChart: IPieChartData[];
  loading: {
    punchCard: boolean;
    summaryData: boolean;
    trend: boolean;
    integrationChart: boolean;
    tagChart: boolean;
  };
};

class VolumenAndResponseReportContainer extends React.Component<
  FinalProps,
  State
> {
  constructor(props: FinalProps) {
    super(props);

    this.state = {
      summaryData: [],
      trend: [],
      punchCard: [],
      integrationChart: [],
      tagChart: [],

      loading: {
        summaryData: false,
        trend: false,
        punchCard: false,
        integrationChart: false,
        tagChart: false
      }
    };
  }

  componentDidMount() {
    this.load('summaryData', 'insightsSummaryData', false);
  }

  componentWillUpdate(nextProps) {
    if (
      JSON.stringify(this.props.queryParams) !==
      JSON.stringify(nextProps.queryParams)
    ) {
      this.load('summaryData', 'insightsSummaryData', false);
    }
  }

  load = (queryName: string, graphqQueryName: string, skip: boolean) => {
    const { queryParams, type } = this.props;

    if (skip) {
      return;
    }

    // loading true
    let loading = this.state.loading;
    loading[queryName] = true;
    this.setState({ loading });

    client
      .query({
        query: gql(queries[queryName]),
        variables: {
          type,
          brandIds: queryParams.brandIds,
          integrationIds: queryParams.integrationIds,
          startDate: queryParams.startDate,
          endDate: queryParams.endDate
        }
      })
      .then(({ data }: any) => {
        loading = this.state.loading;
        loading[queryName] = false;

        // loading false && setting data
        this.setState({
          loading,
          [queryName]: data[graphqQueryName] || []
        } as any);

        if (queryName === 'summaryData') {
          this.load('trend', 'insightsTrend', false);
        }

        if (queryName === 'trend') {
          this.load('punchCard', 'insightsPunchCard', false);
        }

        if (queryName === 'punchCard') {
          this.load(
            'integrationChart',
            'insightsIntegrations',
            type === 'response'
          );
        }

        if (queryName === 'integrationChart') {
          this.load('tagChart', 'insightsTags', type === 'response');
        }
      });
  };

  render() {
    const { type, brandsQuery, history, queryParams } = this.props;

    const {
      loading,
      summaryData,
      trend,
      punchCard,
      integrationChart,
      tagChart
    } = this.state;

    const extendedProps = {
      history,
      queryParams,
      brands: brandsQuery.brands || [],
      summaryData,
      trend,
      punchCard,
      integrationChart,
      tagChart,
      loading
    };

    if (type === 'volume') {
      const volumeProps = {
        ...extendedProps,
        integrationChart,
        tagChart
      };

      return <VolumeReport {...volumeProps} />;
    }

    return <ResponseReport {...extendedProps} />;
  }
}

export default compose(
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  })
)(VolumenAndResponseReportContainer);

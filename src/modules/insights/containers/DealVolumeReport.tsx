import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DealVolumeReport } from '../components';
import { queries } from '../graphql';
import {
  DealMainQueryResponse,
  DealPunchCardQueryResponse,
  IDealParams,
  IQueryParams
} from '../types';

type Props = {
  history: any;
  queryParams: IQueryParams;
};

type FinalProps = {
  mainQuery: DealMainQueryResponse;
  punchCardQuery: DealPunchCardQueryResponse;
} & Props;

const DealVolumeReportContainer = (props: FinalProps) => {
  const { history, mainQuery, queryParams, punchCardQuery } = props;

  const data = mainQuery.dealInsightsMain || {};

  const extendedProps = {
    history,
    queryParams,
    trend: data.trend || [],
    summary: data.summary || [],
    punch: punchCardQuery.dealInsightsPunchCard || [],
    loading: {
      main: mainQuery.loading,
      punch: punchCardQuery.loading
    }
  };

  return <DealVolumeReport {...extendedProps} />;
};

export default compose(
  graphql(gql(queries.dealInsightsPunchCard), {
    name: 'punchCardQuery',
    options: ({ queryParams }: IDealParams) => ({
      fetchPolicy: 'network-only',
      variables: {
        boardId: queryParams.boardId,
        pipelineIds: queryParams.pipelineIds,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate
      }
    })
  }),
  graphql(gql(queries.dealInsightsMain), {
    name: 'mainQuery',
    options: ({ queryParams }: IDealParams) => ({
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      variables: {
        boardId: queryParams.boardId,
        pipelineIds: queryParams.pipelineIds,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate
      }
    })
  })
)(DealVolumeReportContainer);

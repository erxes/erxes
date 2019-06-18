import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { DealVolumeReport } from '../components';
import { queries } from '../graphql';
import {
  DealMainQueryResponse,
  DealPunchCardQueryResponse,
  DealTeamMemberResponse,
  IChartParams,
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
  insightsByTeamMemberQuery: DealTeamMemberResponse;
  status?: string;
} & Props;

const DealVolumeReportContainer = (props: FinalProps) => {
  const {
    history,
    mainQuery,
    queryParams,
    punchCardQuery,
    status,
    insightsByTeamMemberQuery
  } = props;

  const data = mainQuery.dealInsightsMain || {};
  let teamMembers;

  if (status) {
    teamMembers = insightsByTeamMemberQuery.dealInsightsByTeamMember || [];
  }

  const extendedProps = {
    history,
    queryParams,
    trend: data.trend || [],
    summary: data.summary || [],
    punch: punchCardQuery.dealInsightsPunchCard || [],
    teamMembers,
    loading: {
      main: mainQuery.loading,
      punch: punchCardQuery.loading,
      teamMember:
        insightsByTeamMemberQuery.dealInsightsByTeamMember &&
        insightsByTeamMemberQuery.loading
    }
  };

  return <DealVolumeReport {...extendedProps} />;
};

const options = ({ queryParams, status }: IDealParams) => ({
  fetchPolicy: 'network-only',
  variables: {
    boardId: queryParams.boardId,
    pipelineIds: queryParams.pipelineIds,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate,
    status
  }
});

export default compose(
  graphql(gql(queries.dealInsightsByTeamMember), {
    name: 'insightsByTeamMemberQuery',
    options
  }),
  graphql(gql(queries.dealInsightsPunchCard), {
    name: 'punchCardQuery',
    options
  }),
  graphql(gql(queries.dealInsightsMain), {
    name: 'mainQuery',
    options
  })
)(DealVolumeReportContainer);

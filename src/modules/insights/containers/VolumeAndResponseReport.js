import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ResponseReport, VolumeReport } from '../components';
import { queries } from '../graphql';

const VolumenAndResponseReportContainer = props => {
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

VolumenAndResponseReportContainer.propTypes = {
  history: PropTypes.object,
  type: PropTypes.string,
  queryParams: PropTypes.object,
  volumePieChartQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  punchCardQuery: PropTypes.object,
  mainQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.pieChart), {
    name: 'volumePieChartQuery',
    skip: ({ type }) => type === 'response',
    options: ({ queryParams }) => ({
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
    options: ({ queryParams, type }) => ({
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
    options: ({ queryParams, type }) => ({
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

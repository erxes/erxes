import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { VolumeReport } from '../components';
import { queries } from '../graphql';

const VolumeReportContainer = props => {
  const {
    history,
    volumePieChartQuery,
    brandsQuery,
    punchCardQuery,
    mainQuery,
    queryParams
  } = props;

  const data = mainQuery.insightsMain || {};
  const updatedProps = {
    history,
    queryParams,
    insights: volumePieChartQuery.insights || [],
    trend: data.trend || [],
    brands: brandsQuery.brands || [],
    punch: punchCardQuery.insightsPunchCard || [],
    summary: data.summary || [],
    loading: {
      main: mainQuery.loading,
      insights: volumePieChartQuery.loading,
      punch: punchCardQuery.loading
    }
  };

  return <VolumeReport {...updatedProps} />;
};

VolumeReportContainer.propTypes = {
  history: PropTypes.object,
  queryParams: PropTypes.object,
  volumePieChartQuery: PropTypes.object,
  brandsQuery: PropTypes.object,
  punchCardQuery: PropTypes.object,
  mainQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.pieChart), {
    name: 'volumePieChartQuery',
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
    options: ({ queryParams }) => ({
      fetchPolicy: 'network-only',
      variables: {
        type: 'volume',
        brandId: queryParams.brandId,
        integrationType: queryParams.integrationType,
        endDate: queryParams.endDate
      }
    })
  }),
  graphql(gql(queries.main), {
    name: 'mainQuery',
    options: ({ queryParams }) => ({
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      variables: {
        type: 'volume',
        brandId: queryParams.brandId,
        integrationType: queryParams.integrationType,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate
      }
    })
  }),
  graphql(gql(queries.brands), { name: 'brandsQuery' })
)(VolumeReportContainer);

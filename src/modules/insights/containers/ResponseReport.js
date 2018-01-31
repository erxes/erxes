import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ResponseReport } from '../components';
import { queries } from '../graphql';

const ResponseReportContainer = props => {
  const {
    brandsQuery,
    history,
    punchCardQuery,
    mainQuery,
    queryParams
  } = props;

  const data = mainQuery.insightsMain || {};
  const updatedProps = {
    history,
    queryParams,
    trend: data.trend || [],
    teamMembers: data.teamMembers || [],
    brands: brandsQuery.brands || [],
    punch: punchCardQuery.insightsPunchCard || [],
    summary: data.summary || [],
    isLoading:
      brandsQuery.loading || punchCardQuery.loading || mainQuery.loading
  };

  return <ResponseReport {...updatedProps} />;
};

ResponseReportContainer.propTypes = {
  history: PropTypes.object,
  queryParams: PropTypes.object,
  brandsQuery: PropTypes.object,
  punchCardQuery: PropTypes.object,
  mainQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.punchCard), {
    name: 'punchCardQuery',
    options: ({ queryParams }) => ({
      fetchPolicy: 'network-only',
      variables: {
        type: 'response',
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
        type: 'response',
        brandId: queryParams.brandId,
        integrationType: queryParams.integrationType,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate
      }
    })
  }),
  graphql(gql(queries.brands), { name: 'brandsQuery' })
)(ResponseReportContainer);

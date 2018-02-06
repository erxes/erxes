import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ResponseCloseReport } from '../components';
import { queries } from '../graphql';

const ResponseCloseReportContainer = props => {
  const { brandsQuery, history, responseCloseQuery, queryParams } = props;

  const data = responseCloseQuery.insightsResponseClose || {};
  const updatedProps = {
    history,
    queryParams,
    trend: data.trend || [],
    time: data.time,
    teamMembers: data.teamMembers || [],
    brands: brandsQuery.brands || [],
    isLoading: brandsQuery.loading || responseCloseQuery.loading
  };

  return <ResponseCloseReport {...updatedProps} />;
};

ResponseCloseReportContainer.propTypes = {
  queryParams: PropTypes.object,
  brandsQuery: PropTypes.object,
  history: PropTypes.object,
  responseCloseQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.responseClose), {
    name: 'responseCloseQuery',
    options: ({ queryParams }) => ({
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
      variables: {
        brandId: queryParams.brandId,
        integrationType: queryParams.integrationType,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate
      }
    })
  }),
  graphql(gql(queries.brands), { name: 'brandsQuery' })
)(ResponseCloseReportContainer);

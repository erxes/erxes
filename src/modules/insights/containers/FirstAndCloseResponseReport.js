import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FirstResponse, ResponseCloseReport } from '../components';
import { queries } from '../graphql';

const FirstAndCloseResponseReportContainer = props => {
  const {
    type,
    brandsQuery,
    history,
    firstResponseQuery,
    responseCloseQuery,
    queryParams
  } = props;

  let data;
  let loading;

  if (type === 'close') {
    data = responseCloseQuery.insightsResponseClose || {};
    loading = responseCloseQuery.loading;
  } else {
    data = firstResponseQuery.insightsFirstResponse || {};
    loading = firstResponseQuery.loading;
  }

  const extendedProps = {
    history,
    queryParams,
    trend: data.trend || [],
    time: data.time,
    teamMembers: data.teamMembers || [],
    brands: brandsQuery.brands || [],
    isLoading: brandsQuery.loading || loading
  };

  if (type === 'close') {
    return <ResponseCloseReport {...extendedProps} />;
  }

  return <FirstResponse {...extendedProps} />;
};

FirstAndCloseResponseReportContainer.propTypes = {
  queryParams: PropTypes.object,
  brandsQuery: PropTypes.object,
  history: PropTypes.object,
  responseCloseQuery: PropTypes.object,
  type: PropTypes.string,
  firstResponseQuery: PropTypes.object
};

const commonOptions = (queryParams, skip) => ({
  skip,
  fetchPolicy: 'network-only',
  notifyOnNetworkStatusChange: true,
  variables: {
    brandId: queryParams.brandId,
    integrationType: queryParams.integrationType,
    startDate: queryParams.startDate,
    endDate: queryParams.endDate
  }
});

export default compose(
  graphql(gql(queries.firstResponse), {
    name: 'firstResponseQuery',
    options: ({ queryParams, type }) =>
      commonOptions(queryParams, type !== 'first')
  }),
  graphql(gql(queries.responseClose), {
    name: 'responseCloseQuery',
    options: ({ queryParams, type }) =>
      commonOptions(queryParams, type !== 'close')
  }),
  graphql(gql(queries.brands), { name: 'brandsQuery' })
)(FirstAndCloseResponseReportContainer);

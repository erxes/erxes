import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { FirstResponse } from '../components';
import { queries } from '../graphql';

const FirstResponseReportContainer = props => {
  const { brandsQuery, firstResponseQuery } = props;

  const data = firstResponseQuery.insightsFirstResponse || {};
  const updatedProps = {
    trend: data.trend || [],
    time: data.time,
    teamMembers: data.teamMembers || [],
    brands: brandsQuery.brands || [],
    isLoading: brandsQuery.loading || firstResponseQuery.loading,
  };

  return <FirstResponse {...updatedProps} />;
};

FirstResponseReportContainer.propTypes = {
  queryParams: PropTypes.object,
  brandsQuery: PropTypes.object,
  firstResponseQuery: PropTypes.object,
};

export default compose(
  graphql(gql(queries.firstResponse), {
    name: 'firstResponseQuery',
    options: ({ queryParams }) => ({
      fetchPolicy: 'network-only',
      variables: {
        brandId: queryParams.brandId,
        integrationType: queryParams.integrationType,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
      },
    }),
  }),
  graphql(gql(queries.brands), { name: 'brandsQuery' }),
)(FirstResponseReportContainer);

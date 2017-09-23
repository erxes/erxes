import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import { FirstResponse } from '../components';

const FirstResponseReportContainer = props => {
  const { brandsQuery, firstResponseQuery } = props;

  if (brandsQuery.loading || firstResponseQuery.loading) {
    return <Loading title="First Response Report" />;
  }

  const data = firstResponseQuery.insightsFirstResponse;
  const updatedProps = {
    trend: data.trend,
    teamMembers: [],
    brands: brandsQuery.brands,
  };

  return <FirstResponse {...updatedProps} />;
};

FirstResponseReportContainer.propTypes = {
  queryParams: PropTypes.object,
  brandsQuery: PropTypes.object,
  firstResponseQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query insightsFirstResponse($integrationType: String, $brandId: String, 
        $startDate: String, $endDate: String) {
        insightsFirstResponse(integrationType: $integrationType, brandId: $brandId, 
          startDate: $startDate, endDate: $endDate)
      }
    `,
    {
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
    },
  ),
  graphql(
    gql`
    query brands {
      brands {
        _id
        name
      }
    }`,
    { name: 'brandsQuery' },
  ),
)(FirstResponseReportContainer);

import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import { Loading } from '/imports/react-ui/common';
import { ResponseReport } from '../components';

const ResponseReportContainer = props => {
  const { brandsQuery, punchCardQuery, mainQuery } = props;

  if (brandsQuery.loading || punchCardQuery.loading || mainQuery.loading) {
    return <Loading title="Response Report" />;
  }

  const data = mainQuery.insightsMain;
  const updatedProps = {
    trend: data.trend,
    teamMembers: [],
    brands: brandsQuery.brands,
    punch: punchCardQuery.insightsPunchCard,
    summary: data.summary,
  };

  return <ResponseReport {...updatedProps} />;
};

ResponseReportContainer.propTypes = {
  queryParams: PropTypes.object,
  brandsQuery: PropTypes.object,
  punchCardQuery: PropTypes.object,
  mainQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query insightsPunchCard($type: String, $integrationType: String,
        $brandId: String, $endDate: String) {
        insightsPunchCard(type: $type, integrationType: $integrationType,
          brandId: $brandId, endDate: $endDate) {
          day
          value
        }
      }
    `,
    {
      name: 'punchCardQuery',
      options: ({ queryParams }) => ({
        fetchPolicy: 'network-only',
        variables: {
          type: 'response',
          brandId: queryParams.brandId,
          integrationType: queryParams.integrationType,
          endDate: queryParams.endDate,
        },
      }),
    },
  ),
  graphql(
    gql`
      query insightsMain($type: String, $integrationType: String,
        $brandId: String, $startDate: String, $endDate: String) {
        insightsMain(type: $type, integrationType: $integrationType,
          brandId: $brandId, startDate: $startDate, endDate: $endDate)
      }
    `,
    {
      name: 'mainQuery',
      options: ({ queryParams }) => ({
        fetchPolicy: 'network-only',
        variables: {
          type: 'response',
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
)(ResponseReportContainer);

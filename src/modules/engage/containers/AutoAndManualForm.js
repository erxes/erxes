import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { AutoAndManualForm } from '../components';
import { queries } from '../graphql';
import withFormMutations from './withFormMutations';

const AutoAndManualFormContainer = props => {
  const { segmentsQuery, emailTemplatesQuery, customerCountsQuery } = props;

  // TODO change query to get only customerCounts
  const customerCounts = customerCountsQuery.customerCounts || {
    all: 0,
    byBrand: {},
    byIntegrationType: {},
    bySegment: {},
    byTag: {}
  };

  let counts = customerCounts.bySegment || {};
  let segments = segmentsQuery.segments || [];

  const segmentPush = () => {
    segments = segmentsQuery.refetch();
    counts = customerCountsQuery.refetch();
  };

  const updatedProps = {
    ...props,
    segmentPush,
    segments,
    templates: emailTemplatesQuery.emailTemplates || [],
    counts
  };

  return <AutoAndManualForm {...updatedProps} />;
};

AutoAndManualFormContainer.propTypes = {
  segmentsQuery: PropTypes.object,
  emailTemplatesQuery: PropTypes.object,
  customerCountsQuery: PropTypes.object
};

export default withFormMutations(
  compose(
    graphql(gql(queries.emailTemplates), { name: 'emailTemplatesQuery' }),
    graphql(gql(queries.segments), { name: 'segmentsQuery' }),
    graphql(gql(queries.customerCounts), {
      name: 'customerCountsQuery'
    })
  )(AutoAndManualFormContainer)
);

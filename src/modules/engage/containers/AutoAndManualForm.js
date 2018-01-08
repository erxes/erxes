import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { AutoAndManualForm } from '../components';
import Step1 from '../components/step/Step1';
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
  const counts = customerCounts.bySegment || {};

  const updatedProps = {
    ...props,
    segments: segmentsQuery.segments || [],
    templates: emailTemplatesQuery.emailTemplates || [],
    counts
  };

  return <Step1 {...updatedProps} />;
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

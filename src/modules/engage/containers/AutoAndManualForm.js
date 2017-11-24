import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Spinner } from 'modules/common/components';
import { AutoAndManualForm } from '../components';
import { queries } from '../graphql';
import withFormMutations from './withFormMutations';

const AutoAndManualFormContainer = props => {
  const { segmentsQuery, emailTemplatesQuery, customerCountsQuery } = props;

  if (
    segmentsQuery.loading ||
    emailTemplatesQuery.loading ||
    customerCountsQuery.loading
  ) {
    return <Spinner />;
  }

  const templates = emailTemplatesQuery.emailTemplates;
  const segments = segmentsQuery.segments;

  // TODO change query to get only customerCounts
  const customerCounts = customerCountsQuery.customerCounts || {};
  const counts = customerCounts.bySegment || {};

  const updatedProps = {
    ...props,
    segments,
    templates,
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

import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Filter } from '../components';
import { queries } from '../graphql';

const FilterContainer = props => {
  const { integrationsQuery } = props;

  const updatedProps = {
    ...props,
    integrations: integrationsQuery.integrations || [],
    loading: integrationsQuery.loading
  };

  return <Filter {...updatedProps} />;
};

FilterContainer.propTypes = {
  integrationsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'integrationsQuery'
  })
)(FilterContainer);

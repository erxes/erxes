import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Filter } from '../components';
import { queries } from '../graphql';

const FilterContainer = props => {
  const { brandsQuery } = props;

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands || [],
    loading: brandsQuery.loading
  };

  return <Filter {...updatedProps} />;
};

FilterContainer.propTypes = {
  brandsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery'
  })
)(FilterContainer);

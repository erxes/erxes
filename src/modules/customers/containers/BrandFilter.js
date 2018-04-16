import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from 'modules/settings/brands/graphql';
import { BrandFilter } from '../components';

const BrandFilterContainer = props => {
  const { brandsQuery } = props;

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands || [],
    loading: brandsQuery.loading
  };

  return <BrandFilter {...updatedProps} />;
};

BrandFilterContainer.propTypes = {
  brandsQuery: PropTypes.object
};

export default compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery'
  })
)(BrandFilterContainer);

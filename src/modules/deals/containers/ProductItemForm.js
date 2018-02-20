import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ProductItemForm } from '../components';
import { queries } from '../graphql';

class ProductItemFormContainer extends React.Component {
  render() {
    const { productsQuery } = this.props;
    const products = productsQuery.products || [];

    const extendedProps = {
      ...this.props,
      products
    };

    return <ProductItemForm {...extendedProps} />;
  }
}

const propTypes = {
  productsQuery: PropTypes.object
};

ProductItemFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.products), {
    name: 'productsQuery'
  })
)(ProductItemFormContainer);

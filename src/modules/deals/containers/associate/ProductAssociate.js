import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import {
  mutations as productMutations,
  queries as productQueries
} from 'modules/settings/productService/graphql';
import { Alert } from 'modules/common/utils';
import { CommonAssociate } from 'modules/customers/components';
import { Form as ProductForm } from 'modules/settings/productService/containers';

class ProductAssociateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
  }

  render() {
    const { data, productsQuery, productAdd } = this.props;

    const search = (value, loadmore) => {
      if (!loadmore) {
        this.setState({ perPage: 0 });
      }

      this.setState({ perPage: this.state.perPage + 20 }, () =>
        productsQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage
        })
      );
    };

    const clearState = () => {
      productsQuery.refetch({ searchValue: '' });
    };

    // add customer
    const addProduct = ({ doc }, callback) => {
      productAdd({
        variables: doc
      })
        .then(() => {
          productsQuery.refetch();
          Alert.success('Success');
          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const form = <ProductForm save={addProduct} />;

    const renderName = product => {
      return product.name;
    };

    const updatedProps = {
      ...this.props,
      data: {
        name: data.name,
        datas: data.products
      },
      search,
      title: 'Product',
      form,
      renderName,
      perPage: this.state.perPage,
      add: addProduct,
      clearState,
      datas: productsQuery.products || []
    };

    return <CommonAssociate {...updatedProps} />;
  }
}

ProductAssociateContainer.propTypes = {
  data: PropTypes.object.isRequired,
  productsQuery: PropTypes.object.isRequired,
  productAdd: PropTypes.func.isRequired
};

export default compose(
  graphql(gql(productQueries.products), {
    name: 'productsQuery',
    options: {
      variables: {
        perPage: 20
      }
    }
  }),
  // mutations
  graphql(gql(productMutations.productAdd), {
    name: 'productAdd'
  })
)(ProductAssociateContainer);

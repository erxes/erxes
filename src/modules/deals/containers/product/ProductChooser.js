import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import {
  mutations as productMutations,
  queries as productQueries
} from 'modules/settings/productService/graphql';
import { Alert } from 'modules/common/utils';
import { Chooser } from 'modules/common/components';
import { Form as ProductForm } from 'modules/settings/productService/components';

class ProductChooser extends React.Component {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  render() {
    const { data, productsQuery, productAdd } = this.props;
    const { __ } = this.context;

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

    // add product
    const addProduct = (doc, callback) => {
      productAdd({
        variables: doc
      })
        .then(() => {
          productsQuery.refetch();

          Alert.success(__('Success'));

          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const form = <ProductForm save={addProduct} />;

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.products },
      search,
      title: 'Product',
      form,
      renderName: product => product.name,
      perPage: this.state.perPage,
      add: addProduct,
      clearState,
      datas: productsQuery.products || []
    };

    return <Chooser {...updatedProps} />;
  }
}

ProductChooser.propTypes = {
  data: PropTypes.object.isRequired,
  productsQuery: PropTypes.object.isRequired,
  productAdd: PropTypes.func.isRequired
};

ProductChooser.contextTypes = {
  __: PropTypes.func
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
)(ProductChooser);

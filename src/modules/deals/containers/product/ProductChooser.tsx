import gql from 'graphql-tag';
import { Chooser } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { Form as ProductForm } from 'modules/settings/productService/components';
import {
  mutations as productMutations,
  queries as productQueries
} from 'modules/settings/productService/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  data: any;
  productsQuery: any;

  // TODO: replace any
  productAdd: (params: { variables: any }) => Promise<any>;
  closeModal: () => void;
  onSelect: (products: any[]) => void;
};

class ProductChooser extends React.Component<Props, any> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  render() {
    const { data, productsQuery, productAdd, onSelect } = this.props;

    const search = (value, reload) => {
      if (!reload) {
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

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.products },
      search,
      title: 'Product',
      renderName: product => product.name,
      renderForm: (props) => <ProductForm {...props} action={addProduct} />,
      perPage: this.state.perPage,
      add: addProduct,
      clearState,
      datas: productsQuery.products || [],
      onSelect
    };

    return <Chooser {...updatedProps} />;
  }
}

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

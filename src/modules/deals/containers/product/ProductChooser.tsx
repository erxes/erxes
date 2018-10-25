import gql from 'graphql-tag';
import { Chooser } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import { Form as ProductForm } from 'modules/settings/productService/components';
import {
  mutations as productMutations,
  queries as productQueries
} from 'modules/settings/productService/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IProduct } from '../../../settings/productService/types';
import { ProductAddMutationResponse, ProductsQueryResponse } from '../../types';

type Props = {
  data: { name: string; products: IProduct[] };
  closeModal: () => void;
  onSelect: (products: IProduct[]) => void;
};

type FinalProps = { productsQuery: ProductsQueryResponse } & Props &
  ProductAddMutationResponse;

class ProductChooser extends React.Component<FinalProps, { perPage: number }> {
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
      renderForm: props => <ProductForm {...props} action={addProduct} />,
      perPage: this.state.perPage,
      add: addProduct,
      clearState,
      datas: productsQuery.products || [],
      onSelect
    };

    return <Chooser {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<{}, ProductsQueryResponse, { perPage: number }>(
      gql(productQueries.products),
      {
        name: 'productsQuery',
        options: {
          variables: {
            perPage: 20
          }
        }
      }
    ),
    // mutations
    graphql<{}, ProductAddMutationResponse, IProduct>(
      gql(productMutations.productAdd),
      {
        name: 'productAdd'
      }
    )
  )(ProductChooser)
);

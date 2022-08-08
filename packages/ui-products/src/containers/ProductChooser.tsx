import queryString from 'query-string';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import Chooser from '@erxes/ui/src/components/Chooser';
import { Alert, withProps } from '@erxes/ui/src/utils';
import ProductCategoryChooser from '../components/ProductCategoryChooser';
import {
  mutations as productMutations,
  queries as productQueries
} from '../graphql';
import {
  IProduct,
  IProductDoc,
  ProductAddMutationResponse,
  ProductsQueryResponse
} from '../types';
import ProductForm from './ProductForm';
import { ProductCategoriesQueryResponse } from '@erxes/ui-products/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  data: { name: string; products: IProduct[] };
  categoryId: string;
  onChangeCategory: (catgeoryId: string) => void;
  closeModal: () => void;
  onSelect: (products: IProduct[]) => void;
  loadDiscountPercent?: (productsData: any) => void;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productCategoriesQuery: ProductCategoriesQueryResponse;
} & Props &
  ProductAddMutationResponse;

class ProductChooser extends React.Component<FinalProps, { perPage: number }> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  search = (value: string, reload?: boolean) => {
    if (!reload) {
      this.setState({ perPage: 0 });
    }

    this.setState({ perPage: this.state.perPage + 20 }, () =>
      this.props.productsQuery.refetch({
        searchValue: value,
        perPage: this.state.perPage
      })
    );
  };

  // add product
  addProduct = (doc: IProductDoc, callback: () => void) => {
    this.props
      .productAdd({
        variables: doc
      })
      .then(() => {
        this.props.productsQuery.refetch();

        Alert.success('You successfully added a product or service');

        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  renderProductCategoryChooser = () => {
    const { productCategoriesQuery, onChangeCategory } = this.props;

    return (
      <ProductCategoryChooser
        categories={productCategoriesQuery.productCategories || []}
        onChangeCategory={onChangeCategory}
      />
    );
  };

  renderDiscount = data => {
    const { loadDiscountPercent } = this.props;
    if (isEnabled('loyalties') && loadDiscountPercent && data) {
      const productData = {
        product: {
          _id: data._id
        },
        quantity: 1
      };
      loadDiscountPercent(productData);
    }
  };

  render() {
    const { data, productsQuery, onSelect } = this.props;

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.products },
      search: this.search,
      title: 'Product',
      renderName: (product: IProduct) => {
        if (product.code) {
          return product.code.concat(' - ', product.name);
        }

        return product.name;
      },
      renderForm: ({ closeModal }: { closeModal: () => void }) => (
        <ProductForm closeModal={closeModal} />
      ),
      perPage: this.state.perPage,
      add: this.addProduct,
      clearState: () => this.search('', true),
      datas: productsQuery.products || [],
      onSelect
    };

    return (
      <Chooser
        {...updatedProps}
        renderFilter={this.renderProductCategoryChooser}
        handleExtra={this.renderDiscount}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<
      { categoryId: string },
      ProductsQueryResponse,
      { perPage: number; categoryId: string }
    >(gql(productQueries.products), {
      name: 'productsQuery',
      options: props => ({
        variables: {
          perPage: 20,
          categoryId: props.categoryId,
          pipelineId: queryString.parse(location.search).pipelineId,
          boardId: queryString.parse(location.search).boardId
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<{}, ProductCategoriesQueryResponse, {}>(
      gql(productQueries.productCategories),
      {
        name: 'productCategoriesQuery'
      }
    ),
    // mutations
    graphql<{}, ProductAddMutationResponse, IProduct>(
      gql(productMutations.productAdd),
      {
        name: 'productAdd',
        options: () => ({
          refetchQueries: [
            {
              query: gql(productQueries.products),
              variables: { perPage: 20 }
            }
          ]
        })
      }
    )
  )(ProductChooser)
);

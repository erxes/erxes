import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Chooser from 'modules/common/components/Chooser';
import { Alert, withProps } from 'modules/common/utils';
import ProductCategoryChooser from 'modules/deals/components/product/ProductCategoryChooser';
import ProductForm from 'modules/settings/productService/containers/product/ProductForm';
import {
  mutations as productMutations,
  queries as productQueries
} from 'modules/settings/productService/graphql';
import { ProductCategoriesQueryResponse } from 'modules/settings/productService/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { IProduct, IProductDoc } from '../../../settings/productService/types';
import { ProductAddMutationResponse, ProductsQueryResponse } from '../../types';

type Props = {
  data: { name: string; products: IProduct[] };
  categoryId: string;
  onChangeCategory: (catgeoryId: string) => void;
  closeModal: () => void;
  onSelect: (products: IProduct[]) => void;
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

  clearState = () => {
    this.props.productsQuery.refetch({ searchValue: '' });
  };

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

  render() {
    const { data, productsQuery, onSelect } = this.props;

    const updatedProps = {
      ...this.props,
      data: { name: data.name, datas: data.products },
      search: this.search,
      title: 'Product',
      renderName: (product: IProduct) => product.name,
      renderForm: ({ closeModal }: { closeModal: () => void }) => (
        <ProductForm closeModal={closeModal} />
      ),
      perPage: this.state.perPage,
      add: this.addProduct,
      clearState: this.clearState,
      datas: productsQuery.products || [],
      onSelect
    };

    return (
      <Chooser
        {...updatedProps}
        renderSidebar={this.renderProductCategoryChooser}
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
          categoryId: props.categoryId
        }
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

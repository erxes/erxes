import { IProduct } from '@erxes/ui-products/src/types';
import React from 'react';
import { graphql } from 'react-apollo';
import ProductForm from '../../components/product/ProductForm';
import {
  IDeal,
  IPaymentsData,
  IProductData,
  ProductCategoriesQueryResponse
} from '../../types';
import { AppConsumer } from 'coreui/appContext';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { queries } from '../../graphql';

type Props = {
  onChangeProductsData: (productsData: IProductData[]) => void;
  saveProductsData: () => void;
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  productsData: IProductData[];
  products: IProduct[];
  paymentsData?: IPaymentsData;
  currentProduct?: string;
  closeModal: () => void;
  dealQuery: IDeal;
  productCategoriesQuery: ProductCategoriesQueryResponse;
};

class ProductFormContainer extends React.Component<Props> {
  render() {
    return (
      <AppConsumer>
        {({ currentUser }) => {
          if (!currentUser) {
            return;
          }

          const configs = currentUser.configs || {};

          const { productCategoriesQuery } = this.props;

          const categories = productCategoriesQuery.productCategories || [];

          const extendedProps = {
            ...this.props,
            categories: categories,
            loading: productCategoriesQuery.loading,
            uom: configs.dealUOM || [],
            currencies: configs.dealCurrency || []
          };

          return <ProductForm {...extendedProps} />;
        }}
      </AppConsumer>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<{}, ProductCategoriesQueryResponse, {}>(
      gql(queries.productCategories),
      {
        name: 'productCategoriesQuery'
      }
    )
  )(ProductFormContainer)
);

import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import ProductForm from '../../components/product/ProductForm';
import React from 'react';
import { AppConsumer } from 'coreui/appContext';
import { graphql } from '@apollo/client/react/hoc';
import { IProduct } from '@erxes/ui-products/src/types';
import { ProductCategoriesQueryResponse } from '@erxes/ui-products/src/types';
import { queries } from '../../graphql';
import { withProps } from '@erxes/ui/src/utils/core';
import {
  IPurchase,
  IPaymentsData,
  IProductData,
  IExpensesData,
  CostQueryResponse
} from '../../types';

type Props = {
  onChangeProductsData: (productsData: IProductData[]) => void;
  saveProductsData: () => void;
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  onchangeExpensesData: (expensesData: IExpensesData[]) => void;
  expensesData: IExpensesData[];
  productsData: IProductData[];
  products: IProduct[];
  paymentsData?: IPaymentsData;
  currentProduct?: string;
  closeModal: () => void;
  purchaseQuery: IPurchase;
  productCategoriesQuery: ProductCategoriesQueryResponse;
  CostQueryResponse: CostQueryResponse;
  costsQuery: any;
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

          const {
            productCategoriesQuery,
            costsQuery,
            purchaseQuery
          } = this.props;

          const categories = productCategoriesQuery.productCategories || [];

          const costsQueryData = costsQuery.costs;

          const costPriceQuery = purchaseQuery.products || 0;
          const extendedProps = {
            ...this.props,
            costsQueryData,
            costPriceQuery,
            categories: categories,
            loading: productCategoriesQuery.loading,
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
    ),
    graphql<{}, CostQueryResponse, {}>(gql(queries.costs), {
      name: 'costsQuery'
    })
  )(ProductFormContainer)
);

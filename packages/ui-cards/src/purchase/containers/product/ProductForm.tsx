import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import ProductForm from '../../components/product/ProductForm';
import React from 'react';
import { AppConsumer } from 'coreui/appContext';
import { graphql } from 'react-apollo';
import { CostQueryResponse, IProduct } from '@erxes/ui-products/src/types';
import { ProductCategoriesQueryResponse } from '@erxes/ui-products/src/types';
import { queries } from '../../graphql';
import { withProps } from '@erxes/ui/src/utils/core';
import {
  IPurchase,
  IPaymentsData,
  IProductData,
  IExpensesData
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
  costsQuery: CostQueryResponse;
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

          const { costsQuery } = this.props;

          const costsQueryData = costsQuery.costs || [];

          const extendedProps = {
            ...this.props,
            costsQueryData,
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
    ),
    graphql<{}, CostQueryResponse, {}>(gql(queries.costs), {
      name: 'costsQuery'
    })
  )(ProductFormContainer)
);

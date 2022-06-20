import { IProduct } from '@erxes/ui-products/src/types';
import React from 'react';
import ProductForm from '../../components/product/ProductForm';
import { IPaymentsData, IProductData } from '../../types';
import { AppConsumer } from '@erxes/ui/src/appContext';

type Props = {
  onChangeProductsData: (productsData: IProductData[]) => void;
  saveProductsData: () => void;
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  productsData: IProductData[];
  products: IProduct[];
  paymentsData?: IPaymentsData;
  currentProduct?: string;
  closeModal: () => void;
};

export default class ProductFormContainer extends React.Component<Props> {
  render() {
    return (
      <AppConsumer>
        {({ currentUser }) => {
          if (!currentUser) {
            return;
          }

          const configs = currentUser.configs || {};

          const extendedProps = {
            ...this.props,
            uom: configs.dealUOM || [],
            currencies: configs.dealCurrency || []
          };

          return <ProductForm {...extendedProps} />;
        }}
      </AppConsumer>
    );
  }
}

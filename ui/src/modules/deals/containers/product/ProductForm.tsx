import { AppConsumer } from 'appContext';
import React from 'react';
import { IProductData, IPaymentsData } from '../../types';
import { IProduct } from 'modules/settings/productService/types';

type Props = {
  onChangeProductsData: (productsData: IProductData[]) => void;
  saveProductsData: () => void;
  savePaymentsData: () => void;
  onChangePaymentsData: (paymentsData: IPaymentsData) => void;
  productsData: IProductData[];
  products: IProduct[];
  paymentsData?: IPaymentsData;
  closeModal: () => void;
};

export default class ProductItemFormContainer extends React.Component<Props> {
  render() {
    return (
      <AppConsumer>
        {({ currentUser }) => {

          if (!currentUser) {
            return;
          }

          return null;
        }}
      </AppConsumer>
    )
  }
}

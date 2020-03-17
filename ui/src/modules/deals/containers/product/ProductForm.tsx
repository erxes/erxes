import { AppConsumer } from 'appContext';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import ProductForm from '../../components/product/ProductForm';
import { IPaymentsData, IProductData } from '../../types';

type Props = {
  onChangeProductsData: (productsData: IProductData[]) => void;
  saveProductsData: () => void;
  savePaymentsData: () => void;
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
<<<<<<< HEAD


=======
>>>>>>> b20c4f13f7dafb2bcb04303da36eb841b8b526b4
          if (!currentUser) {
            return;
          }

          const configs = currentUser.configs || {};

          const extendedProps = {
            ...this.props,
            uom: configs.dealUOM || [],
            currencies: configs.dealCurrency || []
          };

<<<<<<< HEAD
          return <ProductForm {...extendedProps} />

=======
          return <ProductForm {...extendedProps} />;
>>>>>>> b20c4f13f7dafb2bcb04303da36eb841b8b526b4
        }}
      </AppConsumer>
    );
  }
}

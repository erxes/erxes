import { AppConsumer } from 'appContext';
import React from 'react';
import ProductItemForm from '../../components/product/ProductItemForm';
import { IProductData } from '../../types';

type Props = {
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  productsData?: IProductData[];
  onChangeProductsData: (productsData: IProductData[]) => void;
  updateTotal: () => void;
};

export default class ProductItemFormContainer extends React.Component<Props> {
  render() {
    return (
      <AppConsumer>
        {({ currentUser }) => {

          if (!currentUser) {
            return;
          }

          const { configs } = currentUser;

          const uomConf = configs.find(c => c.code === 'dealUOM') || { value: [] };
          const currenciesConf = configs.find(c => c.code === 'dealCurrency') || { value: [] };

          const extendedProps = {
            ...this.props,
            uom: uomConf.value,
            currencies: currenciesConf.value
          };

          return <ProductItemForm {...extendedProps} />
        }}
      </AppConsumer>
    )
  }
}
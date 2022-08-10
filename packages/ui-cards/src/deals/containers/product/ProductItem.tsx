import { isEnabled, withProps } from '@erxes/ui/src/utils/core';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import React from 'react';
import gql from 'graphql-tag';
import { mutations, queries } from '../../graphql';
import { IDeal, IProductData } from '../../types';
import ProductItem from '../../components/product/ProductItem';

type Props = {
  uom: string[];
  currencies: string[];
  productsData?: IProductData[];
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  onChangeProductsData?: (productsData: IProductData[]) => void;
  updateTotal?: () => void;
  currentProduct?: string;
  onChangeDiscount: (id: string, discount: number) => void;
  dealQuery: IDeal;
  confirmLoyalties?: any;
};

class ProductItemContainer extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { confirmLoyalties } = this.props;

    const confirmLoyalty = variables => {
      confirmLoyalties({ variables });
    };

    const updatedProps = {
      ...this.props,
      confirmLoyalties: confirmLoyalty
    };

    return <ProductItem {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(mutations.confirmLoyalties), {
      name: 'confirmLoyalties',
      skip: () => !isEnabled('loyalties')
    })
  )(ProductItemContainer)
);

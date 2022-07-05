import { isEnabled, withProps } from '@erxes/ui/src/utils/core';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import React from 'react';
import gql from 'graphql-tag';
import { queries } from '../../graphql';
import { IProductData } from '../../types';
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
  checkLoyalty: any;
  onChangeDiscount: (id: string, discount: number) => void;
  dealQuery:any
};

class ProductItemContainer extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const updatedProps = {
      ...this.props,
      checkLoyalty: this.props.checkLoyalty
    };

    return <ProductItem {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.checkLoyalties), {
      name: 'checkLoyalty',
      skip:!isEnabled('loyalties')
    })
  )(ProductItemContainer)
);

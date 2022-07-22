import { isEnabled, withProps } from '@erxes/ui/src/utils/core';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import React from 'react';
import gql from 'graphql-tag';
import { mutations, queries } from '../../graphql';
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
  checkDiscount: any;
  onChangeDiscount: (id: string, discount: number) => void;
  dealQuery: any;
  confirmLoyalties: any;
};

class ProductItemContainer extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { checkDiscount, confirmLoyalties } = this.props;

    const confirmLoyalty = variables => {
      confirmLoyalties({ variables });
    };

    const updatedProps = {
      ...this.props,
      checkDiscount: checkDiscount,
      discountValue: checkDiscount?.checkDiscount
        ? Object.values(checkDiscount.checkDiscount)[0]
        : null,
      confirmLoyalties: confirmLoyalty
    };

    return <ProductItem {...updatedProps} />;
  }
}

const generateParams = ({ productsData, dealQuery }) => ({
  _id: dealQuery._id,
  products: [
    {
      productId: productsData[0].productId,
      quantity: productsData[0].quantity
    }
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.checkDiscount), {
      name: 'checkDiscount',
      skip: ({ productsData }) =>
        !isEnabled('loyalties') || productsData?.length === 0,
      options: ({ productsData, dealQuery }) => ({
        variables: generateParams({ productsData, dealQuery }),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props>(gql(mutations.confirmLoyalties), {
      name: 'confirmLoyalties',
      skip: () => !isEnabled('loyalties')
    })
  )(ProductItemContainer)
);

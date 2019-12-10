import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries as generalQueries } from 'modules/settings/general/graphql';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { ConfigDetailQueryResponse } from '../../../settings/general/types';
import ProductItemForm from '../../components/product/ProductItemForm';
import { IProductData } from '../../types';

type Props = {
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  productsData?: IProductData[];
  onChangeProductsData: (productsData: IProductData[]) => void;
  updateTotal: () => void;
};

type FinalProps = {
  getUomQuery: ConfigDetailQueryResponse;
  getCurrenciesQuery: ConfigDetailQueryResponse;
} & Props;

class ProductItemFormContainer extends React.Component<FinalProps> {
  render() {
    const { getUomQuery, getCurrenciesQuery } = this.props;

    const uom = getUomQuery.configsDetail
      ? getUomQuery.configsDetail.value
      : [];

    const currencies = getCurrenciesQuery.configsDetail
      ? getCurrenciesQuery.configsDetail.value
      : [];

    const extendedProps = {
      ...this.props,
      uom,
      currencies
    };

    return <ProductItemForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConfigDetailQueryResponse, { code: string }>(
      gql(generalQueries.configsDetail),
      {
        name: 'getUomQuery',
        options: {
          variables: {
            code: 'dealUOM'
          }
        }
      }
    ),
    graphql<Props, ConfigDetailQueryResponse, { code: string }>(
      gql(generalQueries.configsDetail),
      {
        name: 'getCurrenciesQuery',
        options: {
          variables: {
            code: 'dealCurrency'
          }
        }
      }
    )
  )(ProductItemFormContainer)
);

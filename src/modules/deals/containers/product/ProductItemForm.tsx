import gql from 'graphql-tag';
import { queries as generalQueries } from 'modules/settings/general/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { ICurrencies } from '../../../settings/general/types';
import { ProductItemForm } from '../../components';
import { IProductData } from '../../types';

type Props = {
  productData: IProductData;
  removeProductItem?: (productId: string) => void;
  productsData?: IProductData[];
  onChangeProductsData: (productsData: IProductData[]) => void;
  updateTotal: () => void;
};

type GetUomQueryResponse = {
  configsDetail: ICurrencies;
};

type GetCurrenciesQueryResponse = {
  configsDetail: ICurrencies;
};

type FinalProps = {
  getUomQuery: any;
  getCurrenciesQuery: any;
  productDetailQuery: any;
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
    graphql<Props, GetUomQueryResponse, { code: string }>(
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
    graphql<Props, GetCurrenciesQueryResponse, { code: string }>(
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

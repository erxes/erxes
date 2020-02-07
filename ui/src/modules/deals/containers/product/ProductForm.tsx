import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from 'modules/common/components/Spinner';
import { queries as generalQueries } from 'modules/settings/general/graphql';
import { IProduct } from 'modules/settings/productService/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { ConfigDetailQueryResponse } from '../../../settings/general/types';
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
  closeModal: () => void;
};

type FinalProps = {
  getUomQuery: ConfigDetailQueryResponse;
  getCurrenciesQuery: ConfigDetailQueryResponse;
} & Props;

class ProductFormContainer extends React.Component<FinalProps> {
  render() {
    const { getUomQuery, getCurrenciesQuery } = this.props;

    if (getUomQuery.loading || getCurrenciesQuery.loading) {
      return <Spinner />;
    }

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

    return <ProductForm {...extendedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConfigDetailQueryResponse, { code: string }>(
      gql(generalQueries.configsDetail),
      {
        name: "getUomQuery",
        options: {
          variables: {
            code: "dealUOM"
          }
        }
      }
    ),
    graphql<Props, ConfigDetailQueryResponse, { code: string }>(
      gql(generalQueries.configsDetail),
      {
        name: "getCurrenciesQuery",
        options: {
          variables: {
            code: "dealCurrency"
          }
        }
      }
    )
  )(ProductFormContainer)
);

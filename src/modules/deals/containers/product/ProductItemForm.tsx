import gql from 'graphql-tag';
import { queries as generalQueries } from 'modules/settings/general/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ProductItemForm } from '../../components';

type Props = {
  getUomQuery: any;
  getCurrenciesQuery: any;
  productDetailQuery: any;
  productData: any;
};

class ProductItemFormContainer extends React.Component<Props> {
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

export default compose(
  graphql(gql(generalQueries.configsDetail), {
    name: 'getUomQuery',
    options: {
      variables: {
        code: 'dealUOM'
      }
    }
  }),
  graphql(gql(generalQueries.configsDetail), {
    name: 'getCurrenciesQuery',
    options: {
      variables: {
        code: 'dealCurrency'
      }
    }
  })
)(ProductItemFormContainer);

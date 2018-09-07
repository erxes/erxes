import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries as generalQueries } from 'modules/settings/general/graphql';
import { ProductItemForm } from '../../components';

class ProductItemFormContainer extends React.Component {
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

const propTypes = {
  getUomQuery: PropTypes.object,
  getCurrenciesQuery: PropTypes.object,
  productDetailQuery: PropTypes.object,
  productData: PropTypes.object
};

ProductItemFormContainer.propTypes = propTypes;

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

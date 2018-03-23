import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { ProductItemForm } from '../../components';
import { queries } from 'modules/settings/general/graphql';

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
  getCurrenciesQuery: PropTypes.object
};

ProductItemFormContainer.propTypes = propTypes;

export default compose(
  graphql(gql(queries.configsDetail), {
    name: 'getUomQuery',
    options: {
      variables: {
        code: 'dealUOM'
      }
    }
  }),
  graphql(gql(queries.configsDetail), {
    name: 'getCurrenciesQuery',
    options: {
      variables: {
        code: 'dealCurrency'
      }
    }
  })
)(ProductItemFormContainer);

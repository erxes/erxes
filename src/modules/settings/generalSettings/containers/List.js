import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { List } from '../components';
import { Spinner } from 'modules/common/components';

const ListContainer = props => {
  const { insertConfig, currencyConfigQuery, uomConfigQuery } = props;

  if (currencyConfigQuery.loading || uomConfigQuery.loading) {
    return <Spinner objective />;
  }

  // create or update action
  const save = (code, value) => {
    insertConfig({
      variables: { code, value }
    })
      .then(() => {
        currencyConfigQuery.refetch();
        uomConfigQuery.refetch();

        Alert.success('Successfully saved!');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const currencies = currencyConfigQuery.getConfig;
  const uom = uomConfigQuery.getConfig;

  const updatedProps = {
    ...props,
    currencies: currencies ? currencies.value : ['MNT', 'USD'],
    uom: uom ? uom.value : ['PC', 'H'],
    save
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  currencyConfigQuery: PropTypes.object,
  uomConfigQuery: PropTypes.object,
  insertConfig: PropTypes.func
};

export default compose(
  graphql(gql(queries.getConfig), {
    name: 'currencyConfigQuery',
    options: () => ({
      variables: {
        code: 'dealCurrency'
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.getConfig), {
    name: 'uomConfigQuery',
    options: () => ({
      variables: {
        code: 'dealUOM'
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.insertConfig), {
    name: 'insertConfig'
  })
)(ListContainer);

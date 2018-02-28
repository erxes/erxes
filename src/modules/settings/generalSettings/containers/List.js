import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { List } from '../components';
import { Spinner } from 'modules/common/components';
const currencyCode = 'dealCurrency';

const ListContainer = props => {
  const { insertConfig, configQuery } = props;

  if (configQuery.loading) {
    return <Spinner objective />;
  }

  // create or update action
  const save = value => {
    insertConfig({
      variables: { code: currencyCode, value }
    })
      .then(() => {
        configQuery.refetch();

        Alert.success('Successfully saved!');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const currencyConfig = configQuery.getConfig;

  const updatedProps = {
    ...props,
    currencyValue: currencyConfig ? currencyConfig.value : ['MNT', 'USD'],
    uomValue: currencyConfig ? currencyConfig.value : ['PC', 'EA'],
    save
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  configQuery: PropTypes.object,
  insertConfig: PropTypes.func
};

export default compose(
  graphql(gql(queries.getConfig), {
    name: 'configQuery',
    options: () => ({
      variables: {
        code: currencyCode
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.insertConfig), {
    name: 'insertConfig'
  })
)(ListContainer);

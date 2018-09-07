import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { List } from '../components';
import { Spinner } from 'modules/common/components';

class ListContainer extends React.Component {
  render() {
    const { insertConfig, currencyConfigQuery, uomConfigQuery } = this.props;
    const { __ } = this.context;

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

          Alert.success(__('Successfully saved.'));
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const currencies = currencyConfigQuery.configsDetail;
    const uom = uomConfigQuery.configsDetail;

    const updatedProps = {
      ...this.props,
      currencies: currencies ? currencies.value : [],
      uom: uom ? uom.value : [],
      save
    };

    return <List {...updatedProps} />;
  }
}

ListContainer.propTypes = {
  currencyConfigQuery: PropTypes.object,
  uomConfigQuery: PropTypes.object,
  insertConfig: PropTypes.func
};

ListContainer.contextTypes = {
  __: PropTypes.func
};

export default compose(
  graphql(gql(queries.configsDetail), {
    name: 'currencyConfigQuery',
    options: () => ({
      variables: {
        code: 'dealCurrency'
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.configsDetail), {
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

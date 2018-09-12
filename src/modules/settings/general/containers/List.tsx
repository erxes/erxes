import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { __, Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';
import { mutations, queries } from '../graphql';

class ListContainer extends React.Component<Props> {
  render() {
    const { insertConfig, currencyConfigQuery, uomConfigQuery } = this.props;

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

type Props = {
  currencyConfigQuery: any,
  uomConfigQuery: any,
  insertConfig: (params: {variables: { code: string, value: string }}) => any,
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

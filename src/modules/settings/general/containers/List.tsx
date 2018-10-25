import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { __, Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';
import { mutations, queries } from '../graphql';
import {
  ConfigDetailQueryResponse,
  InsertConfigMutationResponse,
  InsertConfigMutationVariables
} from '../types';

type Props = {
  currencyConfigQuery: ConfigDetailQueryResponse;
  uomConfigQuery: ConfigDetailQueryResponse;
} & InsertConfigMutationResponse;

class ListContainer extends React.Component<Props> {
  render() {
    const { insertConfig, currencyConfigQuery, uomConfigQuery } = this.props;

    if (currencyConfigQuery.loading || uomConfigQuery.loading) {
      return <Spinner objective={true} />;
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

    return (
      <AppConsumer>
        {({ currentLanguage, changeLanguage }) => (
          <List
            {...updatedProps}
            currentLanguage={currentLanguage}
            changeLanguage={changeLanguage}
          />
        )}
      </AppConsumer>
    );
  }
}

export default withProps<{ queryParams: any }>(
  compose(
    graphql<Props, ConfigDetailQueryResponse, { code: string }>(
      gql(queries.configsDetail),
      {
        name: 'currencyConfigQuery',
        options: () => ({
          variables: {
            code: 'dealCurrency'
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ConfigDetailQueryResponse, { code: string }>(
      gql(queries.configsDetail),
      {
        name: 'uomConfigQuery',
        options: () => ({
          variables: {
            code: 'dealUOM'
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, InsertConfigMutationResponse, InsertConfigMutationVariables>(
      gql(mutations.insertConfig),
      {
        name: 'insertConfig'
      }
    )
  )(ListContainer)
);

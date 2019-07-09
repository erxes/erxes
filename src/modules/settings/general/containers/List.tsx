import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import Spinner from 'modules/common/components/Spinner';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  ConfigDetailQueryResponse,
  ConfigsInsertMutationResponse,
  ConfigsInsertMutationVariables
} from '../types';

type FinalProps = {
  currencyConfigQuery: ConfigDetailQueryResponse;
  uomConfigQuery: ConfigDetailQueryResponse;
} & ConfigsInsertMutationResponse;

class ListContainer extends React.Component<FinalProps> {
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

          Alert.success('You successfully updated general settings');
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

export default withProps<{}>(
  compose(
    graphql<{}, ConfigDetailQueryResponse, { code: string }>(
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
    graphql<{}, ConfigDetailQueryResponse, { code: string }>(
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
    graphql<{}, ConfigsInsertMutationResponse, ConfigsInsertMutationVariables>(
      gql(mutations.insertConfig),
      {
        name: 'insertConfig'
      }
    )
  )(ListContainer)
);

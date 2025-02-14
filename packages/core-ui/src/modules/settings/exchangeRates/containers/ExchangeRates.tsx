import * as compose from 'lodash.flowright';

import { Alert, confirm } from '@erxes/ui/src/utils';
import { Spinner } from '@erxes/ui/src';
import { mutations, queries } from '../graphql';

import MainListComponent from '../components/ExchangeRates';
import React from 'react';
import client from '@erxes/ui/src/apolloClient';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils/core';
import { MainQueryResponse } from '../types';

type Props = {
  queryParams: Record<string, string>;
};

type FinalProps = {
  listQuery: MainQueryResponse;
} & Props;

class MainList extends React.Component<FinalProps> {
  render() {
    const { listQuery } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    const { list = [], totalCount = 0 } = listQuery?.exchangeRatesMain || {};

    const deleteExchangeRates = (rateIds: string[], callback: () => void) => {
      confirm(
        'This will permanently delete the selected exchange rate(s). Are you sure you want to proceed?',
        {
          hasDeleteConfirm: true,
        }
      ).then(() => {
        client
          .mutate({
            mutation: gql(mutations.exchangeRateRemove),
            variables: { rateIds },
            refetchQueries: ['exchangeRatesMain'],
          })
          .then(() => {
            callback();
            Alert.success('Successfully deleted');
          })
          .catch((e) => {
            Alert.error(e.message);
          });
      });
    };
    return (
      <MainListComponent
        {...this.props}
        rateList={list}
        totalCount={totalCount}
        loading={listQuery.loading}
        deleteExchangeRates={deleteExchangeRates}
      />
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.exchangeRatesMain), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          ...generatePaginationParams(queryParams || {}),
        },
      }),
    })
  )(MainList)
);

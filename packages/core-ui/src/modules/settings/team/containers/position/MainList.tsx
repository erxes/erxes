import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { EmptyState, Spinner } from '@erxes/ui/src';
import { mutations, queries } from '@erxes/ui/src/team/graphql';
import { PositionsMainQueryResponse } from '@erxes/ui/src/team/types';
import { withProps } from '@erxes/ui/src/utils/core';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { Alert, confirm } from '@erxes/ui/src/utils';
import client from '@erxes/ui/src/apolloClient';
import * as compose from 'lodash.flowright';
import React from 'react';
import MainListComponent from '../../components/position/MainList';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  listQuery: PositionsMainQueryResponse;
} & Props;

const MainList = (props: FinalProps) => {
  const { listQuery } = props;
  if (listQuery.loading) {
    return <Spinner />;
  }

  if (listQuery.error) {
    return (
      <EmptyState image="/images/actions/5.svg" text="Something went wrong" />
    );
  }

  const deletePositions = (ids: string[], callback: () => void) => {
    confirm().then(() => {
      client
        .mutate({
          mutation: gql(mutations.positionsRemove),
          variables: { ids },
          refetchQueries: ['positionsMain'],
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

  return <MainListComponent {...props} deletePositions={deletePositions} />;
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.positionsMain), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: {
          searchValue: queryParams.searchValue,
          ...generatePaginationParams(queryParams || {}),
        },
      }),
    }),
  )(MainList),
);

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import List from '../../components/contentTypes/List';
import { queries, mutations } from '../../graphql';
import React from 'react';
import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  TypesQueryResponse,
  TypesRemoveMutationResponse,
  TypesTotalCountQueryResponse
} from '../../types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  history: any;
  queryParams: any;
  getActionBar: (actionBar: any) => void;
  setCount: (count: number) => void;
};

type FinalProps = {
  typesQuery: TypesQueryResponse;
  typesTotalCountQuery: TypesTotalCountQueryResponse;
} & Props &
  TypesRemoveMutationResponse;

function ContentTypesContainer(props: FinalProps) {
  const { typesQuery, typesRemoveMutation, typesTotalCountQuery } = props;

  if (typesTotalCountQuery.loading) {
    return <Spinner objective={true} />;
  }

  const contentTypes = typesQuery.webbuilderContentTypes || [];
  const contentTypesCount =
    typesTotalCountQuery.webbuilderContentTypesTotalCount || 0;

  const remove = (_id: string) => {
    confirm().then(() => {
      typesRemoveMutation({ variables: { _id } })
        .then(() => {
          Alert.success('Successfully removed a type');

          typesQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    contentTypes,
    remove,
    loading: typesQuery.loading,
    contentTypesCount
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<Props, TypesQueryResponse>(gql(queries.contentTypes), {
    name: 'typesQuery',
    options: ({ queryParams }) => ({
      variables: {
        ...generatePaginationParams(queryParams)
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<{}, TypesTotalCountQueryResponse>(
    gql(queries.contentTypesTotalCount),
    {
      name: 'typesTotalCountQuery'
    }
  ),
  graphql<{}, TypesRemoveMutationResponse>(gql(mutations.typesRemove), {
    name: 'typesRemoveMutation'
  })
)(ContentTypesContainer);

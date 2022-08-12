import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import React from 'react';
import * as compose from 'lodash.flowright';
import List from '../../components/entries/List';
import { queries, mutations } from '../../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  EntriesMainQueryResponse,
  EntriesRemoveMutationResponse,
  TypeDetailQueryResponse
} from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  queryParams: any;
  getActionBar: (actionBar: any) => void;
  setCount: (count: number) => void;
};

type FinalProps = {
  entriesMainQuery: EntriesMainQueryResponse;
  contentTypeDetailQuery: TypeDetailQueryResponse;
} & Props &
  EntriesRemoveMutationResponse;

function ListContainer(props: FinalProps) {
  const {
    entriesMainQuery,
    contentTypeDetailQuery,
    entriesRemoveMutation
  } = props;

  if (contentTypeDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  const remove = (_id: string) => {
    confirm().then(() => {
      entriesRemoveMutation({ variables: { _id } })
        .then(() => {
          Alert.success('Successfully deleted a entry');

          entriesMainQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const { list = [], totalCount = 0 } =
    entriesMainQuery.webbuilderEntriesMain || {};
  const contentType = contentTypeDetailQuery.webbuilderContentTypeDetail || {};

  const updatedProps = {
    ...props,
    entries: list,
    loading: entriesMainQuery.loading,
    contentType,
    remove,
    entriesCount: totalCount
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<Props, EntriesMainQueryResponse>(gql(queries.entriesMain), {
    name: 'entriesMainQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentTypeId: queryParams.contentTypeId || '',
        ...generatePaginationParams(queryParams)
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<Props, TypeDetailQueryResponse>(gql(queries.contentTypeDetail), {
    name: 'contentTypeDetailQuery',
    options: ({ queryParams }) => ({
      variables: {
        _id: queryParams.contentTypeId || ''
      }
    })
  }),
  graphql<{}, EntriesRemoveMutationResponse>(gql(mutations.entriesRemove), {
    name: 'entriesRemoveMutation'
  })
)(ListContainer);

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import React from 'react';
import * as compose from 'lodash.flowright';
import List from '../../components/entries/List';
import { queries, mutations } from '../../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  EntriesQueryResponse,
  EntriesRemoveMutationResponse,
  EntriesTotalCountQueryResponse,
  TypeDetailQueryResponse
} from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  history: any;
  queryParams: any;
  getActionBar: (actionBar: any) => void;
  setCount: (count: number) => void;
};

type FinalProps = {
  entriesQuery: EntriesQueryResponse;
  contentTypeDetailQuery: TypeDetailQueryResponse;
  entriesTotalCountQuery: EntriesTotalCountQueryResponse;
} & Props &
  EntriesRemoveMutationResponse;

function ListContainer(props: FinalProps) {
  const {
    entriesQuery,
    contentTypeDetailQuery,
    entriesRemoveMutation,
    entriesTotalCountQuery
  } = props;

  if (contentTypeDetailQuery.loading || entriesTotalCountQuery.loading) {
    return <Spinner objective={true} />;
  }

  const remove = (_id: string) => {
    confirm().then(() => {
      entriesRemoveMutation({ variables: { _id } })
        .then(() => {
          Alert.success('Successfully deleted a entry');

          entriesQuery.refetch();
          entriesTotalCountQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const entries = entriesQuery.webbuilderEntries || [];
  const entriesCount = entriesTotalCountQuery.webbuilderEntriesTotalCount || 0;
  const contentType = contentTypeDetailQuery.webbuilderContentTypeDetail || {};

  const updatedProps = {
    ...props,
    entries,
    loading: entriesQuery.loading,
    contentType,
    remove,
    entriesCount
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<Props, EntriesQueryResponse>(gql(queries.entries), {
    name: 'entriesQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentTypeId: queryParams.contentTypeId || '',
        ...generatePaginationParams(queryParams)
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<Props, EntriesTotalCountQueryResponse>(
    gql(queries.entriesTotalCount),
    {
      name: 'entriesTotalCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          contentTypeId: queryParams.contentTypeId || ''
        }
      })
    }
  ),
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

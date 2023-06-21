import * as compose from 'lodash.flowright';

import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  EntriesMainQueryResponse,
  EntriesRemoveMutationResponse,
  IContentType,
  TypeDetailQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import List from '../../components/entries/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  contentType: IContentType;
  queryParams: any;
};

type FinalProps = {
  entriesMainQuery: EntriesMainQueryResponse;
  contentTypeDetailQuery: TypeDetailQueryResponse;
} & Props &
  EntriesRemoveMutationResponse;

function ListContainer(props: FinalProps) {
  const { entriesMainQuery, contentType, entriesRemoveMutation } = props;

  if (entriesMainQuery.loading) {
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
    options: ({ contentType, queryParams }) => ({
      variables: {
        contentTypeId: contentType._id || '',
        ...generatePaginationParams(queryParams),
        perPage: 60
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<{}, EntriesRemoveMutationResponse>(gql(mutations.entriesRemove), {
    name: 'entriesRemoveMutation'
  })
)(ListContainer);

import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import List from '../../components/contentTypes/List';
import { queries, mutations } from '../../graphql';
import React from 'react';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { TypesQueryResponse, TypesRemoveMutationResponse } from '../../types';

type Props = {
  history: any;
  queryParams: any;
  getActionBar: (actionBar: any) => void;
};

type FinalProps = {
  contentTypesQuery: TypesQueryResponse;
} & Props &
  TypesRemoveMutationResponse;

function ContentTypesContainer(props: FinalProps) {
  const { contentTypesQuery, typesRemoveMutation } = props;

  const contentTypes = contentTypesQuery.webbuilderContentTypes || [];

  const remove = (_id: string) => {
    confirm().then(() => {
      typesRemoveMutation({ variables: { _id } })
        .then(() => {
          Alert.success('Successfully removed a type');

          contentTypesQuery.refetch();
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
    loading: contentTypesQuery.loading
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<{}, TypesQueryResponse>(gql(queries.contentTypes), {
    name: 'contentTypesQuery'
  }),
  graphql<{}, TypesRemoveMutationResponse>(gql(mutations.typesRemove), {
    name: 'typesRemoveMutation'
  })
)(ContentTypesContainer);

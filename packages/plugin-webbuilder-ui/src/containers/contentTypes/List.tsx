import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import List from '../../components/contentTypes/List';
import { queries, mutations } from '../../graphql';
import React from 'react';
import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  TypesRemoveMutationResponse,
  TypesMainQueryResponse
} from '../../types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  queryParams: any;
  getActionBar: (actionBar: any) => void;
  setCount: (count: number) => void;
  selectedSite: string;
};

type FinalProps = {
  typesMainQuery: TypesMainQueryResponse;
} & Props &
  TypesRemoveMutationResponse;

function ContentTypesContainer(props: FinalProps) {
  const { typesRemoveMutation, typesMainQuery } = props;

  if (typesMainQuery.loading) {
    return <Spinner objective={true} />;
  }

  const { list = [], totalCount } =
    typesMainQuery.webbuilderContentTypesMain || {};

  const remove = (_id: string) => {
    confirm().then(() => {
      typesRemoveMutation({ variables: { _id } })
        .then(() => {
          Alert.success('Successfully removed a type');

          typesMainQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    remove,
    contentTypes: list,
    contentTypesCount: totalCount
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<Props, TypesMainQueryResponse>(gql(queries.contentTypesMain), {
    name: 'typesMainQuery',
    options: ({ queryParams, selectedSite }) => ({
      variables: {
        ...generatePaginationParams(queryParams),
        siteId: queryParams.siteId || selectedSite
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<Props, TypesRemoveMutationResponse>(gql(mutations.typesRemove), {
    name: 'typesRemoveMutation',
    options: ({ selectedSite }) => ({
      refetchQueries: [
        {
          query: gql(queries.contentTypes),
          variables: {
            siteId: selectedSite
          }
        }
      ]
    })
  })
)(ContentTypesContainer);

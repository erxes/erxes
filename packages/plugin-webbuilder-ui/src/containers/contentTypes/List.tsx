import * as compose from 'lodash.flowright';

import {
  TypesMainQueryResponse,
  TypesRemoveMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import List from '../../components/contentTypes/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

type Props = {
  siteId: string;
  handleItemSettings: (item: any, type: string) => void;
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

  const updatedProps = {
    ...props,
    contentTypes: list,
    contentTypesCount: totalCount
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<Props, TypesMainQueryResponse>(gql(queries.contentTypesMain), {
    name: 'typesMainQuery',
    options: ({ siteId }) => ({
      variables: {
        siteId
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<Props, TypesRemoveMutationResponse>(gql(mutations.typesRemove), {
    name: 'typesRemoveMutation',
    options: ({ siteId }) => ({
      refetchQueries: [
        {
          query: gql(queries.contentTypes),
          variables: {
            siteId
          }
        }
      ]
    })
  })
)(ContentTypesContainer);

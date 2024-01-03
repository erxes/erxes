import * as compose from 'lodash.flowright';

import {
  TypesMainQueryResponse,
  TypesRemoveMutationResponse
} from '../../types';

import List from '../../components/contentTypes/List';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../graphql';

type Props = {
  siteId: string;
  handleItemSettings: (item: any, type: string) => void;
};

type FinalProps = {
  typesMainQuery: TypesMainQueryResponse;
} & Props;

function ContentTypesContainer(props: FinalProps) {
  const { typesMainQuery } = props;

  if (typesMainQuery.loading) {
    return null;
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
  })
)(ContentTypesContainer);

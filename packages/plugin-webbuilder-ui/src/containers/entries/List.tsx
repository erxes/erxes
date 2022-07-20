import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import React from 'react';
import Bulk from '@erxes/ui/src/components/Bulk';
import * as compose from 'lodash.flowright';
import List from '../../components/entries/List';
import { queries } from '../../graphql';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  entriesQuery: any;
  contentTypeDetailQuery: any;
} & Props;

function ListContainer(props: FinalProps) {
  const { entriesQuery, contentTypeDetailQuery } = props;

  if (contentTypeDetailQuery.loading) {
    return null;
  }

  const entries = entriesQuery.webbuilderEntries || [];
  const contentType = contentTypeDetailQuery.webbuilderContentTypeDetail || {};

  const updatedProps = {
    ...props,
    entries,
    loading: entriesQuery.loading,
    contentType
  };

  const list = bulkProps => {
    return <List {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    entriesQuery.refetch();
  };

  return <Bulk content={list} refetch={refetch} />;
}

export default compose(
  graphql<FinalProps>(gql(queries.entries), {
    name: 'entriesQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentTypeId: queryParams.contentTypeId || ''
      }
    })
  }),
  graphql<FinalProps>(gql(queries.contentTypeDetail), {
    name: 'contentTypeDetailQuery',
    options: ({ queryParams }) => ({
      variables: {
        _id: queryParams.contentTypeId || ''
      }
    })
  })
)(ListContainer);

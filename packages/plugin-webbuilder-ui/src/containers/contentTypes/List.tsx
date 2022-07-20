import gql from 'graphql-tag';
import Bulk from '@erxes/ui/src/components/Bulk';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import List from '../../components/contentTypes/List';
import { queries, mutations } from '../../graphql';
import React from 'react';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  contentTypesQuery: any;
  contentTypesRemoveMutation: any;
} & Props;

function ContentTypesContainer(props: FinalProps) {
  const { contentTypesQuery, contentTypesRemoveMutation } = props;

  const contentTypes = contentTypesQuery.webbuilderContentTypes || [];

  const remove = (_id: string) => {
    confirm().then(() => {
      contentTypesRemoveMutation({ variables: { _id } })
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

  const content = bulkProps => {
    return <List {...updatedProps} {...bulkProps} />;
  };

  return <Bulk content={content} refetch={contentTypesQuery.refetch()} />;
}

export default compose(
  graphql(gql(queries.contentTypes), {
    name: 'contentTypesQuery'
  }),
  graphql(gql(mutations.typesRemove), {
    name: 'contentTypesRemoveMutation'
  })
)(ContentTypesContainer);

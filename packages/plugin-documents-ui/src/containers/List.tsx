import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/List';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  listQuery;
  tagsQuery;
  removeMutation;
  getTypesQuery;
} & Props;

class ListContainer extends React.Component<FinalProps> {
  render() {
    const { getTypesQuery, listQuery, removeMutation, tagsQuery } = this.props;

    const remove = _id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            listQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const contentTypes = getTypesQuery?.documentsGetContentTypes || [];

    const list = listQuery.documents || [];
    const tags = tagsQuery.tags || [];

    console.log('tagsQuery', tagsQuery);

    const updatedProps = {
      ...this.props,
      list,
      tags,
      contentTypes,
      remove
    };

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.documentsGetContentTypes), {
      name: 'getTypesQuery'
    }),

    graphql<Props>(gql(queries.documents), {
      name: 'listQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            contentType: queryParams.contentType,
            tag: queryParams.tag
          }
        };
      }
    }),
    graphql<any, any, { type: string }>(gql(tagQueries.tags), {
      name: 'tagsQuery',
      skip: ({ loadingMainQuery }) => loadingMainQuery,
      options: ({ abortController }) => ({
        variables: {
          type: 'documents:documents'
        },
        context: {
          fetchOptions: { signal: abortController && abortController.signal }
        }
      })
    }),

    // mutations
    graphql(gql(mutations.documentsRemove), { name: 'removeMutation' })
  )(ListContainer)
);

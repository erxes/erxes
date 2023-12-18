import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  listQuery;
  documentsTotalCountQuery;
  removeMutation;
  getTypesQuery;
} & Props;

class ListContainer extends React.Component<FinalProps> {
  render() {
    const {
      queryParams,
      getTypesQuery,
      listQuery,
      documentsTotalCountQuery,
      removeMutation
    } = this.props;

    const remove = _id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            listQuery.refetch();
            documentsTotalCountQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const contentType = queryParams.contentType || '';
    const contentTypes = getTypesQuery?.documentsGetContentTypes || [];

    const list = listQuery.documents || [];
    const totalCount = documentsTotalCountQuery.documentsTotalCount || 0;

    const updatedProps = {
      ...this.props,
      list,
      totalCount,
      contentType,
      contentTypes,
      loading:
        getTypesQuery.loading ||
        listQuery.loading ||
        documentsTotalCountQuery.loading,
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
            searchValue: queryParams.searchValue,
            ...generatePaginationParams(queryParams)
          }
        };
      }
    }),

    graphql<Props>(gql(queries.totalCount), {
      name: 'documentsTotalCountQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            contentType: queryParams.contentType,
            searchValue: queryParams.searchValue
          }
        };
      }
    }),

    // mutations
    graphql(gql(mutations.documentsRemove), { name: 'removeMutation' })
  )(ListContainer)
);

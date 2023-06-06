import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  listQuery;
  removeMutation;
  getTypesQuery;
} & Props;

class ListContainer extends React.Component<FinalProps> {
  render() {
    const { getTypesQuery, listQuery, removeMutation } = this.props;

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

    const updatedProps = {
      ...this.props,
      list,
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
            contentType: queryParams.contentType
          }
        };
      }
    }),

    // mutations
    graphql(gql(mutations.documentsRemove), { name: 'removeMutation' })
  )(ListContainer)
);

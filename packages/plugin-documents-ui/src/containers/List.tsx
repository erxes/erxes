import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/List';
import { mutations, queries } from '../graphql';

type FinalProps = {
  listQuery;
  removeMutation;
};

class ListContainer extends React.Component<FinalProps> {
  render() {
    const { listQuery, removeMutation } = this.props;

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

    const list = listQuery.documents || [];

    const updatedProps = {
      ...this.props,
      list,
      remove
    };

    return <List {...updatedProps} />;
  }
}

export default withProps(
  compose(
    graphql(gql(queries.documents), {
      name: 'listQuery'
    }),

    // mutations
    graphql(gql(mutations.documentsRemove), { name: 'removeMutation' })
  )(ListContainer)
);

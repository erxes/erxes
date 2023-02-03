import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/StoryList';
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

    const list = listQuery.apexStories || [];

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
    graphql(gql(queries.stories), {
      name: 'listQuery'
    }),

    // mutations
    graphql(gql(mutations.storiesRemove), { name: 'removeMutation' })
  )(ListContainer)
);

import gql from 'graphql-tag';
import { __, Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';
import { mutations, queries } from '../graphql';

type Props = {
  productsQuery: any;
  productsCountQuery: any;
  addMutation: (mutation: { variables: { doc: any } }) => any;
  editMutation: (mutation: { variables: { doc: any } }) => any;
  removeMutation: (mutation: { variables: { _id: string } }) => any;
};

class ProductListContainer extends React.Component<Props> {
  render() {
    const {
      productsQuery,
      productsCountQuery,
      addMutation,
      editMutation,
      removeMutation
    } = this.props;

    const products = productsQuery.products || [];

    // remove action
    const remove = _id => {
      confirm('Are you sure ?').then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            productsQuery.refetch();
            productsCountQuery.refetch();

            Alert.success(__('Successfully deleted.'));
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    // create or update action
    const save = (doc, callback, product) => {
      let mutation = addMutation;

      // if edit mode
      if (product) {
        mutation = editMutation;
        doc._id = product._id;
      }

      mutation({
        variables: doc
      })
        .then(() => {
          productsQuery.refetch();
          productsCountQuery.refetch();

          Alert.success(__('Successfully saved.'));

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      products,
      save,
      remove,
      loading: productsQuery.loading,
      productsCount: productsCountQuery.productsTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

export default compose(
  graphql(gql(queries.products), {
    name: 'productsQuery',
    options: ({ queryParams } : { queryParams: any }) => ({
      variables: {
        page: queryParams.page || 1,
        perPage: queryParams.perPage || 20
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.productsCount), {
    name: 'productsCountQuery'
  }),
  graphql(gql(mutations.productAdd), {
    name: 'addMutation'
  }),
  graphql(gql(mutations.productEdit), {
    name: 'editMutation'
  }),
  graphql(gql(mutations.productRemove), {
    name: 'removeMutation'
  })
)(ProductListContainer);

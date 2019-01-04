import gql from 'graphql-tag';
import { __, Alert, confirm, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { List } from '../components';
import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  EditMutationResponse,
  MutationVariables,
  ProductsCountQueryResponse,
  ProductsQueryResponse,
  RemoveMutationResponse
} from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productsCountQuery: ProductsCountQueryResponse;
} & Props &
  AddMutationResponse &
  EditMutationResponse &
  RemoveMutationResponse;

class ProductListContainer extends React.Component<FinalProps> {
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
    const remove = productId => {
      confirm().then(() => {
        removeMutation({
          variables: { _id: productId }
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

export default withProps<Props>(
  compose(
    graphql<Props, ProductsQueryResponse, { page: number; perPage: number }>(
      gql(queries.products),
      {
        name: 'productsQuery',
        options: ({ queryParams }) => ({
          variables: generatePaginationParams(queryParams),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ProductsCountQueryResponse>(gql(queries.productsCount), {
      name: 'productsCountQuery'
    }),
    graphql<Props, AddMutationResponse, MutationVariables>(
      gql(mutations.productAdd),
      {
        name: 'addMutation'
      }
    ),
    graphql<Props, EditMutationResponse, MutationVariables>(
      gql(mutations.productEdit),
      {
        name: 'editMutation'
      }
    ),
    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.productRemove),
      {
        name: 'removeMutation'
      }
    )
  )(ProductListContainer)
);

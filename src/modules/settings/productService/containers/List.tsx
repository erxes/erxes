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

            Alert.success(`You successfully deleted a product or service.`);
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

          Alert.success(
            __(
              `You successfully ${
                product ? 'updated' : 'added'
              } a product and service.`
            )
          );

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

const options = ({ queryParams }) => ({
  refetchQueries: [
    {
      query: gql(queries.products),
      variables: generatePaginationParams(queryParams)
    },
    {
      query: gql(queries.products),
      variables: { perPage: 20 }
    },
    {
      query: gql(queries.productsCount)
    }
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props, ProductsQueryResponse, { page: number; perPage: number }>(
      gql(queries.products),
      {
        name: 'productsQuery',
        options: ({ queryParams }) => ({
          variables: generatePaginationParams(queryParams)
        })
      }
    ),
    graphql<Props, ProductsCountQueryResponse>(gql(queries.productsCount), {
      name: 'productsCountQuery'
    }),
    graphql<Props, AddMutationResponse, MutationVariables>(
      gql(mutations.productAdd),
      {
        name: 'addMutation',
        options
      }
    ),
    graphql<Props, EditMutationResponse, MutationVariables>(
      gql(mutations.productEdit),
      {
        name: 'editMutation',
        options
      }
    ),
    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.productRemove),
      {
        name: 'removeMutation',
        options
      }
    )
  )(ProductListContainer)
);

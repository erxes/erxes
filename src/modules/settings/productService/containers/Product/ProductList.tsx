import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import List from '../../components/Product/ProductList';
import { mutations, queries } from '../../graphql';
import {
  ProductsCountQueryResponse,
  ProductsQueryResponse,
  RemoveMutationResponse
} from '../../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productsCountQuery: ProductsCountQueryResponse;
} & Props &
  RemoveMutationResponse;

class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      productsQuery,
      productsCountQuery,
      removeMutation,
      queryParams
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

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      return (
        <ButtonMutate
          mutation={object ? mutations.productEdit : mutations.productAdd}
          variables={values}
          callback={callback}
          refetchQueries={getRefetchQueries(this.props.queryParams)}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      queryParams,
      products,
      renderButton,
      remove,
      loading: productsQuery.loading,
      productsCount: productsCountQuery.productsTotalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

const getRefetchQueries = queryParams => {
  return [
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
  ];
};

const options = ({ queryParams }) => ({
  refetchQueries: getRefetchQueries(queryParams)
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
    graphql<Props, RemoveMutationResponse, { _id: string }>(
      gql(mutations.productRemove),
      {
        name: 'removeMutation',
        options
      }
    )
  )(ProductListContainer)
);

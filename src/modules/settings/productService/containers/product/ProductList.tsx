import gql from 'graphql-tag';
import Bulk from 'modules/common/components/Bulk';
import { Alert, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import List from '../../components/product/ProductList';
import { mutations, queries } from '../../graphql';
import {
  ProductRemoveMutationResponse,
  ProductsCountQueryResponse,
  ProductsQueryResponse
} from '../../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productsCountQuery: ProductsCountQueryResponse;
} & Props &
  ProductRemoveMutationResponse;

class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      productsQuery,
      productsCountQuery,
      productsRemove,
      queryParams
    } = this.props;

    const products = productsQuery.products || [];

    // remove action
    const remove = ({ productIds }, emptyBulk) => {
      productsRemove({
        variables: { productIds }
      })
        .then(() => {
          emptyBulk();
          Alert.success('You successfully deleted a product');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      queryParams,
      products,
      remove,
      loading: productsQuery.loading,
      productsCount: productsCountQuery.productsTotalCount || 0
    };

    const productList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.productsQuery.refetch();
    };

    return <Bulk content={productList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return [
    'products',
    'productCategorires',
    'productCategoriesCount',
    'productsTotalCount'
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, ProductsQueryResponse, { page: number; perPage: number }>(
      gql(queries.products),
      {
        name: 'productsQuery',
        options: ({ queryParams }) => ({
          variables: {
            categoryId: queryParams.categoryId,
            ...generatePaginationParams(queryParams)
          }
        })
      }
    ),
    graphql<Props, ProductsCountQueryResponse>(gql(queries.productsCount), {
      name: 'productsCountQuery'
    }),
    graphql<Props, ProductRemoveMutationResponse, { productIds: string[] }>(
      gql(mutations.productsRemove),
      {
        name: 'productsRemove',
        options
      }
    )
  )(ProductListContainer)
);

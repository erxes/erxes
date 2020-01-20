import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from 'modules/common/components/Bulk';
import { Alert, withProps } from 'modules/common/utils';
import { generatePaginationParams } from 'modules/common/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../../components/product/ProductList';
import { mutations, queries } from '../../graphql';
import {
  CategoryDetailQueryResponse,
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
  productCategoryDetailQuery: CategoryDetailQueryResponse;
} & Props &
  ProductRemoveMutationResponse;

class ProductListContainer extends React.Component<FinalProps> {
  render() {
    const {
      productsQuery,
      productsCountQuery,
      productsRemove,
      queryParams,
      productCategoryDetailQuery
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
      productsCount: productsCountQuery.productsTotalCount || 0,
      currentCategory: productCategoryDetailQuery.productCategoryDetail || {}
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
    'productsTotalCount',
    'productCountByTags'
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
            tag: queryParams.tag,
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
    ),
    graphql<Props, CategoryDetailQueryResponse>(
      gql(queries.productCategoryDetail),
      {
        name: 'productCategoryDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            _id: queryParams.categoryId
          }
        })
      }
    )
  )(ProductListContainer)
);

import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from 'erxes-ui/lib/components/Bulk';
import { Alert, withProps } from 'erxes-ui/lib/utils';
import * as router from 'erxes-ui/lib/utils/router';

export const generatePaginationParams = router.generatePaginationParams;

import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/product/ProductList';
import { mutations, queries } from '../graphql';
import {
  CarCategoriesQueryResponse,
  CategoryDetailQueryResponse,
  ICarCategory,
  ProductRemoveMutationResponse,
  ProductsCountQueryResponse,
  ProductsQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
  car?: ICarCategory;
  carCategories: ICarCategory[];
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productsCountQuery: ProductsCountQueryResponse;
  productCategoryDetailQuery: CategoryDetailQueryResponse;
  carCategoriesQuery: CarCategoriesQueryResponse;
} & Props &
  ProductRemoveMutationResponse;

class ProductListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      productsQuery,
      productsCountQuery,
      productsRemove,
      queryParams,
      productCategoryDetailQuery,
      history,
      carCategoriesQuery
    } = this.props;

    const products = productsQuery.products || [];

    // remove action
    const remove = ({ productIds }, emptyBulk) => {
      productsRemove({
        variables: { productIds }
      })
        .then(removeStatus => {
          emptyBulk();

          const status = removeStatus.data.productsRemove;

          status === 'deleted'
            ? Alert.success('You successfully deleted a product')
            : Alert.warning('Product status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';

    const carCategories = carCategoriesQuery.carCategories || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      products,
      remove,
      loading: productsQuery.loading,
      searchValue,
      productsCount: productsCountQuery.productsTotalCount || 0,
      currentCategory: productCategoryDetailQuery.productCategoryDetail || {},
      carCategories
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
    'productCategories',
    'productCategoriesCount',
    'productsTotalCount',
    'productCountByTags',
    'carCategories',
    'carCategoriesTotalCount'
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
            searchValue: queryParams.searchValue,
            type: queryParams.type,
            ...generatePaginationParams(queryParams)
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ProductsCountQueryResponse>(gql(queries.productsCount), {
      name: 'productsCountQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
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
    ),
    graphql<Props, CarCategoriesQueryResponse>(gql(queries.carCategories), {
      name: 'carCategoriesQuery'
    })
  )(ProductListContainer)
);

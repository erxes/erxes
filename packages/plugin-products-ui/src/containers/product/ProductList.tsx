import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../../components/product/ProductList';
import { mutations, queries } from '../../graphql';
import {
  CategoryDetailQueryResponse,
  IProduct,
  MergeMutationResponse,
  MergeMutationVariables,
  ProductRemoveMutationResponse,
  ProductsMainQueryResponse,
  ProductsQueryResponse
} from '../../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productCategoryDetailQuery: CategoryDetailQueryResponse;
  productsMainQuery: ProductsMainQueryResponse;
} & Props &
  ProductRemoveMutationResponse &
  MergeMutationResponse;

class ProductListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      mergeProductLoading: false
    };
  }

  render() {
    const {
      productsQuery,
      productsMainQuery,
      productsRemove,
      productsMerge,
      queryParams,
      productCategoryDetailQuery,
      history
    } = this.props;

    if (productsQuery.loading) {
      return false;
    }

    const products = productsQuery.products || [];

    let mainProducts: IProduct[] = [];
    let mainProductsCounts = 0;

    if (productsMainQuery.productsMain) {
      mainProducts = productsMainQuery['productsMain'].list || [];

      mainProductsCounts = productsMainQuery['productsMain'].totalCount || 0;
    }

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

    const mergeProducts = ({ ids, data, callback }) => {
      this.setState({ mergeProductLoading: true });

      productsMerge({
        variables: {
          productIds: ids,
          productFields: data
        }
      })
        .then((result: any) => {
          callback();
          this.setState({ mergeProductLoading: false });
          Alert.success('You successfully merged a product');
          history.push(
            `/settings/product-service/details/${result.data.productsMerge._id}`
          );
        })
        .catch(e => {
          Alert.error(e.message);
          this.setState({ mergeProductLoading: false });
        });
    };

    const searchValue = this.props.queryParams.searchValue || '';

    const updatedProps = {
      ...this.props,
      queryParams,
      products,
      mainProducts,
      mainProductsCounts,
      remove,
      loading: productsMainQuery.loading,
      searchValue,
      currentCategory: productCategoryDetailQuery.productCategoryDetail || {},
      mergeProducts
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
            searchValue: queryParams.searchValue,
            type: queryParams.type,
            ...generatePaginationParams(queryParams)
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<
      Props,
      ProductsMainQueryResponse,
      { page: number; perPage: number }
    >(gql(queries.productsMain), {
      name: 'productsMainQuery',
      options: ({ queryParams }) => ({
        variables: {
          categoryId: queryParams.categoryId,
          tag: queryParams.tag,
          searchValue: queryParams.searchValue,
          type: queryParams.type,
          segment: queryParams.segment,
          segmentData: queryParams.segmentData,
          ...generatePaginationParams(queryParams)
        },
        fetchPolicy: 'network-only'
      })
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
    ),
    graphql<Props, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.productsMerge),
      {
        name: 'productsMerge'
      }
    )
  )(ProductListContainer)
);

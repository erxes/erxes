import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../../components/product/ProductList';
import { mutations, queries } from '../../graphql';
import {
  CategoryDetailQueryResponse,
  MergeMutationResponse,
  MergeMutationVariables,
  ProductRemoveMutationResponse,
  ProductsCountQueryResponse,
  ProductsQueryResponse
} from '../../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  productsQuery: ProductsQueryResponse;
  productsCountQuery: ProductsCountQueryResponse;
  productCategoryDetailQuery: CategoryDetailQueryResponse;
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
      productsCountQuery,
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
      remove,
      loading: productsQuery.loading,
      searchValue,
      productsCount: productsCountQuery.productsTotalCount || 0,
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
            searchValue: queryParams.searchValue,
            type: queryParams.type,
            segment: queryParams.segment,
            segmentData: queryParams.segmentData,
            ...generatePaginationParams(queryParams)
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, ProductsCountQueryResponse>(gql(queries.productsCount), {
      name: 'productsCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          segment: queryParams.segment,
          segmentData: queryParams.segmentData
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

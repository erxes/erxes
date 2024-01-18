import { gql } from '@apollo/client';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React, { useState } from 'react';
import List from '../../components/product/ProductList';
import { mutations, queries } from '../../graphql';
import {
  CategoryDetailQueryResponse,
  MergeMutationResponse,
  ProductRemoveMutationResponse,
  ProductsCountQueryResponse,
  ProductsQueryResponse,
} from '../../types';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

const ProductListContainer = (props: Props) => {
  const [mergeProductLoading, setMergeProductLoading] = useState(false);
  const { queryParams, history } = props;

  const productsQuery = useQuery<ProductsQueryResponse>(gql(queries.products), {
    variables: {
      categoryId: queryParams.categoryId,
      status: queryParams.state,
      tag: queryParams.tag,
      brand: queryParams.brand,
      searchValue: queryParams.searchValue,
      type: queryParams.type,
      segment: queryParams.segment,
      segmentData: queryParams.segmentData,
      ids: queryParams.ids && queryParams.ids.split(','),
      ...generatePaginationParams(queryParams),
    },
    fetchPolicy: 'network-only',
  });

  const productsCountQuery = useQuery<ProductsCountQueryResponse>(
    gql(queries.productsCount),
    {
      variables: {
        categoryId: queryParams.categoryId,
        status: queryParams.state,
        tag: queryParams.tag,
        searchValue: queryParams.searchValue,
        type: queryParams.type,
        segment: queryParams.segment,
        segmentData: queryParams.segmentData,
        ids: queryParams.ids && queryParams.ids.split(','),
      },
      fetchPolicy: 'network-only',
    },
  );

  const productCategoryDetailQuery = useQuery<CategoryDetailQueryResponse>(
    gql(queries.productCategoryDetail),
    {
      variables: {
        _id: queryParams.categoryId,
      },
    },
  );

  const [productsRemove] = useMutation<ProductRemoveMutationResponse>(
    gql(mutations.productsRemove),
    {
      refetchQueries: getRefetchQueries(),
    },
  );

  const [productsMerge] = useMutation<MergeMutationResponse>(
    gql(mutations.productsMerge),
  );

  const products = (productsQuery.data && productsQuery.data.products) || [];

  // remove action
  const remove = ({ productIds }, emptyBulk) => {
    productsRemove({
      variables: { productIds },
    })
      .then((removeStatus) => {
        emptyBulk();

        const status = (removeStatus.data || { productsRemove: '' })
          .productsRemove;

        status === 'deleted'
          ? Alert.success('You successfully deleted a product')
          : Alert.warning('Product status deleted');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const mergeProducts = ({ ids, data, callback }) => {
    setMergeProductLoading(true);

    productsMerge({
      variables: {
        productIds: ids,
        productFields: data,
      },
    })
      .then((result: any) => {
        callback();
        setMergeProductLoading(false);
        Alert.success('You successfully merged a product');
        history.push(
          `/settings/product-service/details/${result.data.productsMerge._id}`,
        );
      })
      .catch((e) => {
        Alert.error(e.message);
        setMergeProductLoading(false);
      });
  };

  const searchValue = queryParams.searchValue || '';

  const updatedProps = {
    ...props,
    queryParams,
    products,
    remove,
    loading: productsQuery.loading || productsCountQuery.loading,
    searchValue,
    productsCount:
      (productsCountQuery.data && productsCountQuery.data.productsTotalCount) ||
      0,
    currentCategory:
      (productCategoryDetailQuery.data &&
        productCategoryDetailQuery.data.productCategoryDetail) ||
      {},
    mergeProducts,
  };

  const productList = (props) => {
    return <List {...updatedProps} {...props} />;
  };

  const refetch = () => {
    productsQuery.refetch();
  };

  return <Bulk content={productList} refetch={refetch} />;
};

const getRefetchQueries = () => {
  return [
    'products',
    'productCategories',
    'productCategoriesCount',
    'productsTotalCount',
    'productCountByTags',
  ];
};

export default ProductListContainer;

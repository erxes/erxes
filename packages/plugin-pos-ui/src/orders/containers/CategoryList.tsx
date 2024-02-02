import { gql, useQuery } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../components/CategoryList';
import { queries } from '../graphql';
import { ProductCategoriesQueryResponse } from '../../types';

type Props = { history: any; queryParams: any };

const CategoryListContainer = (props: Props) => {
  const { queryParams, history } = props;

  const productCategoriesQuery = useQuery<ProductCategoriesQueryResponse>(
    gql(queries.productCategories),
    {
      variables: {
        status: queryParams.status,
        parentId: queryParams.parentId,
      },
      fetchPolicy: 'network-only',
    },
  );

  const productCategories =
    productCategoriesQuery?.data?.productCategories || [];

  const updatedProps = {
    ...props,
    productCategories,
    loading: productCategoriesQuery.loading,
  };

  return <List {...updatedProps} />;
};

export default CategoryListContainer;

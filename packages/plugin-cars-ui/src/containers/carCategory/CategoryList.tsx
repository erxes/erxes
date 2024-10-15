import { Alert, confirm } from '@erxes/ui/src';
import { gql, useQuery, useMutation } from '@apollo/client';
import React from 'react';

import List from '../../components/carCategory/CategoryList';
import { mutations, queries } from '../../graphql';
import {
  CarCategoriesCountQueryResponse,
  CarCategoriesQueryResponse,
  CarCategoryRemoveMutationResponse,
} from '../../types';

type Props = { queryParams: any };

const CategoryListContainer = (props: Props) => {
  const carCategoriesQuery = useQuery<CarCategoriesQueryResponse>(
    gql(queries.carCategories),
    {
      fetchPolicy: 'network-only',
    },
  );

  const carCategoriesCountQuery = useQuery<CarCategoriesCountQueryResponse>(
    gql(queries.carCategoriesCount),
  );

  const [carCategoryRemove] = useMutation<CarCategoryRemoveMutationResponse>(
    gql(mutations.carCategoryRemove),
    {
      refetchQueries: ['carCategories', 'carCategoriesTotalCount'],
    },
  );

  const remove = (carId) => {
    confirm().then(() => {
      carCategoryRemove({
        variables: { _id: carId },
      })
        .then(() => {
          carCategoriesQuery.refetch();
          carCategoriesCountQuery.refetch();

          Alert.success(`You successfully deleted a car & service category`);
        })
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const carCategories = carCategoriesQuery?.data?.carCategories || [];
  const loading = carCategoriesQuery.loading || carCategoriesCountQuery.loading;
  const totalCount =
    carCategoriesCountQuery?.data?.carCategoriesTotalCount || 0;

  const updatedProps = {
    ...props,
    remove,
    refetch: carCategoriesQuery.refetch,
    carCategories,
    loading,
    totalCount,
  };

  return <List {...updatedProps} />;
};

export default CategoryListContainer;

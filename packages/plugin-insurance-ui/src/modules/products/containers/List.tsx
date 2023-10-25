import { Spinner, router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { queries } from '../graphql';

import List from '../components/List';
import { InsuranceProduct, InsuranceProductPage } from '../../../gql/types';
import {
  InsuranceProductsPaginatedQuery,
  InsuranceProductsPaginatedQueryVariables
} from '../graphql/queries.types';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function ProductsContainer(props: Props) {
  const { data, loading, refetch } = useQuery<
    InsuranceProductsPaginatedQuery,
    InsuranceProductsPaginatedQueryVariables
  >(queries.PRODUCTS_PAGINATED, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner />;
  }

  const remove = (id: string) => {
    const message = 'Are you sure want to remove this product ?';

    confirm(message).then(() => {
      //   removeMutation({
      //     variables: { _id: id }
      //   })
      //     .then(() => {
      //       refetch();
      //       Alert.success('You successfully deleted a product.');
      //     })
      //     .catch(e => {
      //       Alert.error(e.message);
      //     });
    });
  };

  const productPage = (data && data.insuranceProductsPaginated) || {};

  const products = (productPage.products || []) as InsuranceProduct[];

  const totalCount = productPage.count || 0;

  const extendedProps = {
    ...props,
    loading,
    products,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}

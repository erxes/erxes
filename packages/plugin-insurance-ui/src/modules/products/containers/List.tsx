import { useQuery, useMutation } from '@apollo/client';
import { Spinner, router } from '@erxes/ui/src';
import React from 'react';
import { queries, mutations } from '../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { InsuranceProduct } from '../../../gql/types';
import List from '../components/List';
import {
  InsuranceProductListQuery,
  InsuranceProductListQueryVariables
} from '../graphql/queries.types';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function ProductsContainer(props: Props) {
  const { data, loading, refetch } = useQuery<
    InsuranceProductListQuery,
    InsuranceProductListQueryVariables
  >(queries.PRODUCTS_PAGINATED, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
    fetchPolicy: 'network-only'
  });

  const [removeMutation] = useMutation(mutations.PRODUCTS_REMOVE);

  if (loading) {
    return <Spinner />;
  }

  const remove = (id: string) => {
    const message = 'Are you sure want to remove this product ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { id }
      })
        .then(() => {
          refetch();
          Alert.success('You successfully deleted a product.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const productPage = (data && data.insuranceProductList) || {};

  const products = (productPage.list || []) as InsuranceProduct[];

  const totalCount = productPage.totalCount || 0;

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

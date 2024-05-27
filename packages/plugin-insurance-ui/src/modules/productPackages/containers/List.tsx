import { Spinner, router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';

import List from '../components/List';

import graphql from '../graphql';
import {
  InsurancePackageListQuery,
  InsurancePackageListQueryVariables
} from '../graphql/queries.types';
import { InsurancePackage } from '../../../gql/types';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function ProductsContainer(props: Props) {
  const { data, loading, refetch } = useQuery<
    InsurancePackageListQuery,
    InsurancePackageListQueryVariables
  >(graphql.queries.GET_PACKAGE_LIST, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner />;
  }

  const remove = (id: string) => {
    const message = 'Are you sure want to remove this package ?';

    confirm(message).then(() => {
      //   removeMutation({
      //     variables: { _id: id }
      //   })
      //     .then(() => {
      //       refetch();
      //       Alert.success('You successfully deleted a package.');
      //     })
      //     .catch(e => {
      //       Alert.error(e.message);
      //     });
    });
  };

  const packages: InsurancePackage[] = data?.insurancePackageList?.list || [];

  const totalCount = data?.insurancePackageList?.totalCount || 0;

  const extendedProps = {
    ...props,
    loading,
    packages,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}

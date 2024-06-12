import React from 'react';

import List from '../components/CollateralTypeList';
import queries from '../graphql/queries';
import useListQuery from '../../component/hooks/useListQuery';
import { useMutation, gql } from '@apollo/client';
import { ICollateralTypeDocument } from '../types';
import { mutations } from '../graphql';
import { Alert, confirm } from '@erxes/ui/src';

type Props = { queryParams: any };

const CollateralTypeListContainer = (props: Props) => {
  const collateralTypesMainQuery = useListQuery<
    ICollateralTypeDocument,
    { collateralTypesMain: any }
  >(
    queries.collateralTypesMain,
    {
      fetchPolicy: 'network-only'
    },
    'collateralTypesMain'
  );

  const [removeMutation] = useMutation(gql(mutations.collateralTypeRemove), {
    refetchQueries: ['collateralTypesMain'],
    onError: (e) => Alert.error(e.message),
    onCompleted: () => Alert.success('Collateral type deleted'),
  });

  const removeAction = (id) => {
    confirm('This will permanently delete are you absolutely sure?', {
      hasDeleteConfirm: true
    }).then(() => {
      removeMutation({ variables: { id } })
    });
  };

  const updatedProps = {
    ...props,
    remove: removeAction,
    refetch: collateralTypesMainQuery.refetch,
    list: collateralTypesMainQuery.list,
    totalCount: collateralTypesMainQuery.totalCount,
    loading: collateralTypesMainQuery.loading
  };

  return <List {...updatedProps} />;
};

export default CollateralTypeListContainer;

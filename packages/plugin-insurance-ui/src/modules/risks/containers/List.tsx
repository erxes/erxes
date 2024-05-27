import { useMutation, useQuery } from '@apollo/client';
import { Spinner, router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../graphql';

import List from '../components/List';
import {
  RisksPaginatedQuery,
  RisksPaginatedQueryVariables
} from '../graphql/queries.types';
import { Risk, RiskPage } from '../../../gql/types';
import {
  RisksRemoveMutation,
  RisksRemoveMutationVariables
} from '../graphql/mutations.types';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function RisksContainer(props: Props) {
  const { data, loading, refetch } = useQuery<
    RisksPaginatedQuery,
    RisksPaginatedQueryVariables
  >(queries.RISKS_PAGINATED, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
    fetchPolicy: 'network-only'
  });

  const [removeMutation] = useMutation<
    RisksRemoveMutation,
    RisksRemoveMutationVariables
  >(mutations.RISKS_REMOVE);

  if (loading) {
    return <Spinner />;
  }

  const remove = (id: string) => {
    const message = 'Are you sure want to remove this risk ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { id }
      })
        .then(() => {
          refetch();
          Alert.success('You successfully deleted a risk.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const riskPage = (data && data.risksPaginated) || ({} as RiskPage);

  const risks = riskPage.risks as Risk[];

  const totalCount = riskPage.count || 0;

  const extendedProps = {
    ...props,
    loading,
    risks,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}

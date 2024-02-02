import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, Bulk, router } from '@erxes/ui/src';
import React from 'react';
import GoalTypesList from '../components/goalTypesList';
import { mutations, queries } from '../graphql';
import {
  ListQueryVariables,
  MainQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables,
} from '../types';

type Props = {
  queryParams: any;
  history: any;
};

const goalTypesList = (props: Props) => {
  const { queryParams, history } = props;

  const goalTypesMainQuery = useQuery<MainQueryResponse>(
    gql(queries.goalTypesMain),
    {
      variables: {
        ...router.generatePaginationParams(queryParams || {}),
        date: queryParams.date,
        endDate: queryParams.endDate,
        branch: queryParams.branch,
        department: queryParams.department,
        unit: queryParams.unit,
        contribution: queryParams.contribution,
      },
      fetchPolicy: 'network-only',
    },
  );

  const [goalTypesRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.goalTypesRemove),
    {
      refetchQueries: ['goalTypesMain'],
    },
  );

  const remove = ({ goalTypeIds }, emptyBulk) => {
    goalTypesRemove({
      variables: { goalTypeIds },
    })
      .then(() => {
        emptyBulk();
        Alert.success('You successfully deleted a goalType');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const goalTypesList = (bulkProps) => {
    const { list = [], totalCount = 0 } =
      goalTypesMainQuery?.data?.goalTypesMain || {};

    const updatedProps = {
      ...props,
      totalCount,
      goalTypes: list,
      loading: goalTypesMainQuery.loading,
      remove,
    };

    return <GoalTypesList {...updatedProps} {...bulkProps} />;
  };

  const refetch = () => {
    goalTypesMainQuery.refetch();
  };

  return <Bulk content={goalTypesList} refetch={refetch} />;
};

export default goalTypesList;

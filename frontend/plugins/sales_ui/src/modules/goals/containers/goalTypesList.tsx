import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { useToast } from 'erxes-ui/hooks';

import GoalTypesList from '../components/goalTypesList';
import { MainQueryResponse, RemoveMutationResponse } from '../types';
import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations';

// helpers
const generatePaginationParams = (queryParams: any) => ({
  page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
  perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20,
});

const normalizeArray = (val?: string | string[] | null) => {
  if (!val) return undefined;
  if (Array.isArray(val)) return val;
  return String(val).split(',').filter(Boolean);
};


const GoalTypesListContainer = () => {
  const { toast } = useToast();
  const location = useLocation();

  
  const queryParams = Object.fromEntries(
    new URLSearchParams(location.search)
  );

  const goalTypesMainQuery = useQuery<MainQueryResponse>(
    gql(queries.goalTypesMain as string),
    {
      variables: {
        ...generatePaginationParams(queryParams),
        date: queryParams.date,
        endDate: queryParams.endDate,
        branch: normalizeArray(queryParams.branch),
        department: normalizeArray(queryParams.department),
        unit: normalizeArray(queryParams.unit),
        contribution: queryParams.contribution || undefined,
      },
      fetchPolicy: 'network-only',
    }
  );

  const [goalTypesRemove] = useMutation<RemoveMutationResponse>(
    mutations.goalsRemove,
    { refetchQueries: ['goalTypesMain'] }
  );

  const remove = ({ goalTypeIds }: { goalTypeIds: string[] }) => {
    goalTypesRemove({ variables: { goalTypeIds } })
      .then(() => {
        toast({
          title: 'Success',
          description: 'Goal type deleted successfully'
        });
      })
      .catch((e) => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: e.message
        });
      });
  };

  const {
    list = [],
    totalCount = 0,
  } = goalTypesMainQuery.data?.goalTypesMain || {};

  return (
    <GoalTypesList
      goalType={list}
      totalCount={totalCount}
      loading={goalTypesMainQuery.loading}
      remove={remove}
      queryParams={queryParams}
    />
  );
};

export default GoalTypesListContainer;

import { gql, useQuery, useMutation } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { ConfigsListQueryResponse } from '../types';

type Props = {
  queryParams?: any;
};

export default function ListContainer({ queryParams }: Props) {
  const location = useLocation();
  const isSettings = location.pathname === '/settings/khanbank';

  const { data, loading, refetch } =
    useQuery<ConfigsListQueryResponse>(
      gql(queries.listQuery),
      {
        fetchPolicy: 'network-only',
      },
    );

  const [removeMutation] = useMutation(
    gql(mutations.removeMutation),
  );

  const remove = async (_id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this config?',
    );

    if (!confirmed) return;

    try {
      await removeMutation({
        variables: { _id },
      });

      await refetch();
    } catch (error: any) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <span className="text-sm text-muted-foreground">
          Loading...
        </span>
      </div>
    );
  }

  const configs =
    data?.khanbankConfigsList?.list ?? [];

  const totalCount =
    data?.khanbankConfigsList?.totalCount ?? 0;

  return (
    <List
      configs={configs}
      totalCount={totalCount}
      loading={loading}
      remove={remove}
      refetch={refetch}
    />
  );
}
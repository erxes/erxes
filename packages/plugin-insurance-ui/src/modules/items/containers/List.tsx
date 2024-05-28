import React from 'react';
import { useQuery } from '@apollo/client';
import Component from '../components/List';
import queries from '../graphql';

type Props = {
  history: any;
  queryParams: any;
};

const List = (props: Props) => {

  const variables: any = {
    ...props.queryParams,
  };

  if (props.queryParams.company) {
    variables.vendor = props.queryParams.company;
  }

  if (props.queryParams.searchValue) {
    variables.searchValue = props.queryParams.searchValue;
    variables.searchField = 'dealNumber'
  }

  const { data, loading } = useQuery(queries.LIST, {
    variables
  });

  const remove = (id: string) => {
    // remove mutation
    console.log(id);
  };

  return (
    <Component
      items={data?.insuranceItemList.list || []}
      totalCount={data?.insuranceItemList.totalCount || 0}
      queryParams={props.queryParams}
      history={props.history}
      loading={loading}
      remove={remove}
    />
  );
};

export default List;

import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';

//erxes
import Spinner from '@erxes/ui/src/components/Spinner';

// local
import RemaindersLogComponent from '../components/RemaindersLog';
import { queries } from '../graphql';

type Props = {
  queryParams: any;
};

const RemaindersLogContainer = (props: Props) => {
  const { queryParams } = props;

  const params = {
    beginDate: queryParams.beginDate,
    endDate: queryParams.endDate,
    categoryId: queryParams.categoryId,
    productIds: queryParams.productIds,
    searchValue: queryParams.searchValue,
    departmentId: queryParams.departmentId,
    branchId: queryParams.branchId
  };
  const remaindersLogQuery: any = useQuery(gql(queries.remaindersLog), {
    variables: params,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  if (remaindersLogQuery.loading) {
    return <Spinner objective={true} />;
  }

  const remaindersLog = remaindersLogQuery.data
    ? remaindersLogQuery.data.remaindersLog
    : ({} as any);

  return (
    <RemaindersLogComponent remaindersLog={remaindersLog} params={params} />
  );
};

export default RemaindersLogContainer;

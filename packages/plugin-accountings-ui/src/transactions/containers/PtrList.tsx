import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, confirm } from "@erxes/ui/src/utils";
import {
  RemoveMainTrMutationResponse,
  TransactionsCountQueryResponse,
  TransactionsQueryResponse,
} from "../types";
import { mutations, queries } from "../graphql";
import Bulk from "@erxes/ui/src/components/Bulk";
import List from "../components/PtrList";
import React, { useMemo } from 'react';

type Props = {
  queryParams: any;
};

const PtrListContainer = (props: Props) => {

  const {
    queryParams,
  } = props;

  const variables = useMemo(() => {
    return {
      ...queryParams,
      page: Number(queryParams?.page | 1)
    };
  }, [queryParams]);

  const transactionsQuery = useQuery<TransactionsQueryResponse>(
    gql(queries.transactions),
    {
      fetchPolicy: 'network-only',
      variables: variables
    }
  );

  const transactionsCountQuery = useQuery<TransactionsCountQueryResponse>(
    gql(queries.transactionsCount),
    {
      fetchPolicy: 'network-only',
      variables: variables
    }
  );

  const refetchQueries = [

  ];

  const [removeAccountMutation] = useMutation<RemoveMainTrMutationResponse>(
    gql(mutations.transactionsRemove),
    {
      refetchQueries
    }
  );

  const remove = (accountIds: string[], emptyBulk) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      removeAccountMutation({
        variables: { accountIds, _id: 'LmNv9veWKr59oZDbpxhTX' },

      })
        .then((removeStatus) => {
          // refresh queries

          emptyBulk();
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const transactions = transactionsQuery.data?.accTransactions || [];
  const transactionsCount = transactionsCountQuery.data?.accTransactionsCount || 0;

  const searchValue = props.queryParams.searchValue || "";

  const updatedProps = {
    ...props,
    queryParams,
    transactions,
    remove,
    loading: transactionsQuery.loading || transactionsCountQuery.loading,
    searchValue,
    transactionsCount,
  };

  const AccountList = (params) => {
    return <List {...updatedProps} {...params} />;
  };

  return <Bulk content={AccountList} />;
};

export default PtrListContainer;

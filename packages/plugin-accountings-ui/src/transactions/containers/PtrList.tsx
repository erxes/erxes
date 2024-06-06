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
  type?: string;
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
      variables: variables
    }
  );

  const transactionsCountQuery = useQuery<TransactionsCountQueryResponse>(
    gql(queries.transactionsCount),
    {
      variables: variables
    }
  );

  const refetchQueries = [

  ];

  const [removeAccountMutation] = useMutation<RemoveMainTrMutationResponse>(
    gql(mutations.ptrRemove),
    {
      refetchQueries
    }
  );
  const remove = (accountIds: string[], emptyBulk) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      removeAccountMutation({
        variables: { accountIds },
      })
        .then((removeStatus) => {
          // refresh queries

          emptyBulk();
          const status = removeStatus.data?.removeMainTrMutation || '';

          // status === "deleted"
          //   ? Alert.success("You successfully deleted a Account")
          //   : Alert.warning("Account status deleted");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const accounts = transactionsQuery.data?.transactions || [];
  const accountsCount = transactionsCountQuery.data?.transactionsCount || 0;

  const searchValue = props.queryParams.searchValue || "";

  const updatedProps = {
    ...props,
    queryParams,
    accounts,
    remove,
    loading: transactionsQuery.loading || transactionsCountQuery.loading,
    searchValue,
    accountsCount,
  };

  const AccountList = (props) => {
    return <List {...updatedProps} {...props} />;
  };

  return <Bulk content={AccountList} />;
};

export default PtrListContainer;

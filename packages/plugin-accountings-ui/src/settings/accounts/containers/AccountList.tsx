import { gql, useQuery, useMutation } from '@apollo/client';
import { Alert, confirm } from "@erxes/ui/src/utils";
import {
  AccountCategoryDetailQueryResponse,
  RemoveAccountMutationResponse,
  AccountsCountQueryResponse,
  AccountsQueryResponse,
} from "../types";
import { mutations, queries } from "../graphql";
import Bulk from "@erxes/ui/src/components/Bulk";
import List from "../components/AccountList";
import React, { useMemo, useState } from 'react';
import { generatePaginationParams } from "@erxes/ui/src/utils/router";
import { useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
  type?: string;
};

const AccountListContainer = (props: Props) => {
  const navigate = useNavigate();

  const {
    queryParams,
  } = props;

  const variables = useMemo(() => {
    return {
      page: Number(queryParams?.page | 1),
      searchValue: queryParams.searchValue
    };
  }, [queryParams]);

  const accountsQuery = useQuery<AccountsQueryResponse>(
    gql(queries.accounts),
    {
      variables: variables
    }
  );

  const accountsCountQuery = useQuery<AccountsCountQueryResponse>(
    gql(queries.accountsTotalCount),
    {
      variables: variables
    }
  );

  const accountCategoryDetailQuery = useQuery<AccountCategoryDetailQueryResponse>(
    gql(queries.accountCategoryDetail),
    {
      skip: !queryParams.categoryId,
      fetchPolicy: "cache-and-network",
      variables: queryParams.categoryId
    }
  )

  const [accountsRemove] = useMutation<RemoveAccountMutationResponse>(
    gql(mutations.accountsRemove),
  );
  const remove = (posId: string, emptyBulk) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      accountsRemove({
        variables: { _id: posId },
      })
        .then((removeStatus) => {
          // refresh queries
          refetch();

          emptyBulk();
          console.log(removeStatus, 'kkkkkkkkkkkkkkkkk')
          const status = removeStatus.data?.removeAccountMutation || '';

          // status === "deleted"
          //   ? Alert.success("You successfully deleted a Account")
          //   : Alert.warning("Account status deleted");
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };
  // const AccountsMerge = 

  const accounts = accountsQuery.data?.accounts || [];

  const searchValue = props.queryParams.searchValue || "";

  const updatedProps = {
    ...props,
    queryParams,
    accounts,
    remove,
    loading: accountsQuery.loading || accountsCountQuery.loading,
    searchValue,
    accountsCount: accountsCountQuery.data?.accountsCount || 0,
    currentCategory: accountCategoryDetailQuery?.data?.accountCategoryDetail,
    // mergeAccounts,
  };

  const AccountList = (props) => {
    return <List {...updatedProps} {...props} />;
  };

  const refetch = () => {
    accountsQuery.refetch();
  };

  return <Bulk content={AccountList} refetch={refetch} />;
};

const getRefetchQueries = () => {
  return [
    "Accounts",
    "AccountCategories",
    "AccountCategoriesCount",
    "AccountsTotalCount",
    "AccountCountByTags",
  ];
};

const options = () => ({
  refetchQueries: getRefetchQueries(),
});

export default AccountListContainer;

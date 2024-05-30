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
    gql(queries.accountsCount),
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

  const refetchQueries = [
    "Accounts",
    "AccountCategories",
    "AccountCategoriesCount",
    "AccountsCount",
  ];

  const [removeAccountMutation] = useMutation<RemoveAccountMutationResponse>(
    gql(mutations.accountsRemove),
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

  const accounts = accountsQuery.data?.accounts || [];
  const accountsCount = accountsCountQuery.data?.accountsCount || 0;
  const currentCategory = accountCategoryDetailQuery?.data?.accountCategoryDetail;

  const searchValue = props.queryParams.searchValue || "";

  const updatedProps = {
    ...props,
    queryParams,
    accounts,
    remove,
    loading: accountsQuery.loading || accountsCountQuery.loading,
    searchValue,
    accountsCount,
    currentCategory,
  };

  const AccountList = (props) => {
    return <List {...updatedProps} {...props} />;
  };

  return <Bulk content={AccountList} />;
};

export default AccountListContainer;

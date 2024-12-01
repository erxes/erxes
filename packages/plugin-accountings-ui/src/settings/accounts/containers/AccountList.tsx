import {
  AccountCategoryDetailQueryResponse,
  AccountsCountQueryResponse,
  AccountsQueryResponse,
  RemoveAccountMutationResponse,
} from "../types";
import { Alert, confirm } from "@erxes/ui/src/utils";
import React, { useMemo } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { mutations, queries } from "../graphql";

import { AppConsumer } from "coreui/appContext";
import Bulk from "@erxes/ui/src/components/Bulk";
import List from "../components/AccountList";

type Props = {
  queryParams: any;
};

const AccountListContainer = (props: Props) => {
  const { queryParams } = props;

  const variables = useMemo(() => {
    return {
      ...queryParams,
      page: Number(queryParams?.page | 1),
    };
  }, [queryParams]);

  const accountsQuery = useQuery<AccountsQueryResponse>(gql(queries.accounts), {
    variables: variables,
  });

  const accountsCountQuery = useQuery<AccountsCountQueryResponse>(
    gql(queries.accountsCount),
    {
      variables: variables,
    }
  );

  const accountCategoryDetailQuery =
    useQuery<AccountCategoryDetailQueryResponse>(
      gql(queries.accountCategoryDetail),
      {
        skip: !queryParams.categoryId,
        fetchPolicy: "cache-and-network",
        variables: { _id: queryParams.categoryId },
      }
    );

  const refetchQueries = [
    "Accounts",
    "AccountCategories",
    "AccountCategoriesCount",
    "AccountsCount",
  ];

  const [removeAccountMutation] = useMutation<RemoveAccountMutationResponse>(
    gql(mutations.accountsRemove),
    {
      refetchQueries,
    }
  );
  const remove = (accountIds: string[], emptyBulk) => {
    const message = "Are you sure?";

    confirm(message).then(() => {
      removeAccountMutation({
        variables: { accountIds },
      })
        .then(() => {
          emptyBulk();
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const accounts = accountsQuery.data?.accounts || [];
  const accountsCount = accountsCountQuery.data?.accountsCount || 0;
  const currentCategory =
    accountCategoryDetailQuery?.data?.accountCategoryDetail;

  const searchValue = props.queryParams.searchValue || "";

  const updatedProps = {
    ...props,
    queryParams,
    accounts,
    remove,
    loading:
      accountsQuery.loading ||
      accountsCountQuery.loading ||
      (accountCategoryDetailQuery && accountCategoryDetailQuery.loading),
    searchValue,
    accountsCount,
    currentCategory,
  };

  const AccountList = (params) => {
    return (
      <AppConsumer>
        {({ currentUser }) => {
          return (
            <List
              {...updatedProps}
              {...params}
              currencies={currentUser?.configs?.dealCurrency || []}
            />
          );
        }}
      </AppConsumer>
    );
  };

  return <Bulk content={AccountList} />;
};

export default AccountListContainer;

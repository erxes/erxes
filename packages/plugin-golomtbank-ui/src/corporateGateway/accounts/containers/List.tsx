import { router, Spinner } from "@erxes/ui/src";
import { gql } from "@apollo/client";
import React from "react";
import { useQuery } from "@apollo/client";
import ErrorMsg from "@erxes/ui/src/components/ErrorMsg";

import List from "../components/List";
import queries from "../graphql/queries";
import { AccountsListQueryResponse } from "../../../types/IGolomtAccount";

type Props = {
  refetch?: () => void;
  configId?: string;
  queryParams: any;
  fetchPolicy?: any;
};

export default function ListContainer(props: Props) {
  const { data, loading, error } = useQuery<AccountsListQueryResponse>(
    gql(queries.listQuery),
    {
      variables: {
        configId: props.configId,
        ...router.generatePaginationParams(props.queryParams || {}),
      },
      fetchPolicy: props.fetchPolicy || "network-only",
    }
  );

  if (loading) {
    return <Spinner />;
  }

  // if (error) {
  //   return <ErrorMsg>{error.message}</ErrorMsg>;
  // }

  // const accounts = (data && data.golomtBankAccounts) || [];
  const accounts = [
    {
      requestId: "cc65ebc637d04541a7e45d753aaddce2",
      accountId: "4005110163",
      accountName: "ОЧИР УНДРАА ОМЗ ББСБ",
      shortName: "ОЧИР УНДРА",
      currency: "USD",
      branchId: "160",
      isSocialPayConnected: "N",
      accountType: {
        schemeCode: "CA658",
        schemeType: "SBA",
      },
    },
  ];
  const extendedProps = {
    ...props,
    loading,
    accounts,
    configId: props.configId || "",
  };

  return <List {...extendedProps} />;
}

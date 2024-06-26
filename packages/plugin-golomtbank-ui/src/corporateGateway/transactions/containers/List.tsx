import { router } from "@erxes/ui/src";
import Spinner from "@erxes/ui/src/components/Spinner";
import dayjs from "dayjs";
import { gql, useQuery } from "@apollo/client";
import React from "react";
import List from "../components/List";
import { queries } from "../graphql";
import { StatementQueryResponse } from "../../../types/ITransactions";
import ErrorMsg from "@erxes/ui/src/components/ErrorMsg";

type Props = {
  queryParams: any;
  showLatest?: boolean;
  refetch?: () => void;
};

export default function ListContainer(props: Props) {
  const { queryParams, showLatest } = props;
  let { page, perPage } = router.generatePaginationParams(queryParams || {});
  let { startDate, endDate } = queryParams;

  if (showLatest) {
    page = 1;
    perPage = 10;

    startDate = dayjs(new Date().setDate(new Date().getDate() - 1)).format(
      "YYYY-MM-DD"
    );
    endDate = dayjs(new Date()).format("YYYY-MM-DD");
  }

  const { data, loading, error } = useQuery<StatementQueryResponse>(
    gql(queries.transactionsQuery),
    {
      variables: {
        page,
        perPage,
        accountId: queryParams.account,
        configId: queryParams._id,
        startDate,
        endDate,
      },
      fetchPolicy: "network-only",
    }
  );
  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMsg>{error.message}</ErrorMsg>;
  }

  const statement = data && data.golomtBankStatements;

  if (!statement) {
    return null;
  }

  const extendedProps = {
    ...props,
    loading: statement.statements ? false : loading,
    statement,
  };

  return <List {...extendedProps} />;
}

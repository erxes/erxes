import Spinner from "@erxes/ui/src/components/Spinner";
import React from "react";
import { useQuery, gql } from "@apollo/client";

import Detail from "../components/Detail";
import queries from "../graphql/queries";
import {
  AccountDetailQueryResponse,
  AccountBalanceQueryResponse,
} from "../../../types/IGolomtAccount";

type Props = {
  queryParams: any;
};

const DetailContainer = (props: Props) => {
  const { _id, account } = props.queryParams;

  const { data, loading } = useQuery<AccountDetailQueryResponse>(
    gql(queries.detailQuery),
    {
      variables: {
        configId: _id,
        accountId: account,
      },
      fetchPolicy: "network-only",
    }
  );
  const balance = useQuery<AccountBalanceQueryResponse>(
    gql(queries.getBalance),
    {
      variables: {
        configId: _id,
        accountId: account,
      },
      fetchPolicy: "network-only",
    }
  );

  if (loading) {
    return <Spinner />;
  }
  const detail = data && data.golomtBankAccountDetail;
  const balances = balance.data?.golomtBankAccountBalance;
  if (!detail) {
    return null;
  }

  const update = {
    ...props,
    loading,
    account: detail,
    balances: balances,
    // accountList: accounts,
  };

  return <Detail {...update} />;
};

export default DetailContainer;

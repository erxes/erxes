import ErrorMsg from "@erxes/ui/src/components/ErrorMsg";
import Spinner from "@erxes/ui/src/components/Spinner";
import { gql } from "@apollo/client";
import React from "react";
import { useQuery } from "@apollo/client";

import Detail from "../components/Detail";
import queries from "../graphql/queries";
import { AccountDetailQueryResponse } from "../../../types/IGolomtAccount";

type Props = {
  queryParams: any;
};

const DetailContainer = (props: Props) => {
  const { _id, account } = props.queryParams;

  const { data, loading, error } = useQuery<AccountDetailQueryResponse>(
    gql(queries.detailQuery),
    {
      variables: {
        configId: _id,
        accountNumber: account,
      },
      fetchPolicy: "network-only",
    }
  );

  if (loading) {
    return <Spinner />;
  }

  // if (error) {
  //   return <ErrorMsg>{error.message}</ErrorMsg>;
  // }

  // const accountDetail = data && data.golomtBankAccountDetail;
  const accountDetail = {
    requestId: "d15b529764394dca937b555fbc854a7a",
    accountNumber: "4005110163",
    currency: "MNT",
    customerName: "XXX XXK",
    titlePrefix: "M/S.",
    accountName: "ОЧИР УНДРАА ОМЗ ББСБ",
    accountShortName: "ОЧИР УНДРА",
    freezeStatusCode: "",
    freezeReasonCode: "",
    openDate: "2017-07-31",
    status: "A",
    productName: "ҮНДСЭН ДАНС-БАЙГУУЛЛАГА",
    type: {
      schemeCode: "CA602",
      schemeType: "SBA",
    },
    intRate: 0,
    isRelParty: "N",
    branchId: "814",
  };

  if (!accountDetail) {
    return null;
  }

  const extendedProps = {
    ...props,
    loading,
    account: accountDetail,
  };

  return (
    <>
      <Detail {...extendedProps} />
    </>
  );
};

export default DetailContainer;

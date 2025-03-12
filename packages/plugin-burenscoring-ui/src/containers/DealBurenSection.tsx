import { gql, useQuery } from "@apollo/client";

import { DetailQueryResponse } from "../types";
import React from "react";
import Section from "../components/common/DealBurenSection";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries } from "../graphql";
import queryString from "query-string";
import { useLocation } from "react-router-dom";

type Props = {
  showType?: string;
};

function BurenSectionContainer(props: Props) {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const customersQuery = useQuery(gql(queries.customers), {
    variables: {
      mainType: "deal",
      mainTypeId: queryParams?.itemId || "",
      relType: "customer",
      isSaved: true,
    },
  });

  const customerScore = useQuery<DetailQueryResponse>(
    gql(queries.getCustomerScore),
    {
      variables: {
        customerId: customersQuery?.data?.customers[0]?._id || "",
      },
      fetchPolicy: "network-only",
    }
  );

  if (customersQuery.loading || customerScore.loading) {
    return <Spinner />;
  }

  const data = customerScore.data?.getCustomerScore;

  const updatedProps = {
    ...props,
    customerId: customersQuery?.data?.customers[0]?._id || "",
    burenCustomerScoring: data,
  };
  return <Section {...updatedProps} />;
}

export default BurenSectionContainer;

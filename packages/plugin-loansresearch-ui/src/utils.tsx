import { gql, useQuery } from "@apollo/client";
import { SectionBodyItem, renderFullName } from "@erxes/ui/src";
import React from "react";
import { Link } from "react-router-dom";
import { queries } from "./graphql";
import { DetailQueryResponse, ILoanResearch } from "./types";

export const useHasDetail = (dealId: string) => {
  // Second query: If no deal details, fetch related customers
  const { data: customerData, loading: customerLoading } = useQuery(
    gql(queries.customers),
    {
      variables: {
        mainType: "deal",
        mainTypeId: dealId,
        relType: "customer",
        isSaved: true,
      },
      skip: !dealId, // Skip if loansResearch exists or dealId is missing
    }
  );

  const customerId = customerData?.customers?.[0]?._id;

  const { data: dealData, loading: dealLoading } =
    useQuery<DetailQueryResponse>(gql(queries.loanResearchDetail), {
      variables: { dealId, customerId },
      skip: !dealId && !customerId, // Ensures hook order remains consistent
    });

  const loansResearch = dealData?.loanResearchDetail as ILoanResearch;

  return {
    loansResearch,
    loading: dealLoading || customerLoading,
  };
};

export const renderBody = (obj: any, type?: string) => {
  if (!obj) {
    return null;
  }

  if (type === "deal") {
    return (
      <div>
        <SectionBodyItem>{obj.name}</SectionBodyItem>
      </div>
    );
  }

  return (
    <div>
      <SectionBodyItem>
        <Link to={`/contacts/details/${obj._id}`}>{renderFullName(obj)}</Link>
      </SectionBodyItem>
    </div>
  );
};

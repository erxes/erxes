import { DetailQueryResponse, ILoanResearch } from "../types";
import { gql, useQuery } from "@apollo/client";

import LoansResearchSidebar from "../components/LoansResearchSidebar";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries } from "../graphql";
import queryString from "query-string";
import { useLocation } from "react-router-dom";

type Props = {
  showType?: string;
};

const LoansResearchSidebarContainer = ({ showType }: Props) => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const loansResearchDetailQuery = useQuery<DetailQueryResponse>(
    gql(queries.loanResearchDetail),
    {
      variables: {
        dealId: queryParams?.itemId || "",
      },
    }
  );

  if (loansResearchDetailQuery.loading) {
    return <Spinner />;
  }

  const loansResearch = loansResearchDetailQuery?.data
    ?.loanResearchDetail as ILoanResearch;

  const updatedProps = {
    showType,
    queryParams,
    loansResearch,
  };
  return <LoansResearchSidebar {...updatedProps} />;
};

export default LoansResearchSidebarContainer;

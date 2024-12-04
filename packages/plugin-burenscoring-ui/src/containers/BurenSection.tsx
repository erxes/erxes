import { gql, useQuery } from "@apollo/client";
import Spinner from '@erxes/ui/src/components/Spinner';
import React from "react";
import Section from "../components/common/BurenSection";
import { queries } from "../graphql";
import { BurenScoringQueryResponse } from "../types";

type Props = {
  collapseCallback?: () => void;
  title?: string;
  mainType?: string;
  id?: string;
};

function BurenSectionContainer(props: Props) {
  const customerScoreList = useQuery<BurenScoringQueryResponse>(
    gql(queries.burenCustomerScoringsMain),
    {
      variables: {
        customerId: props.id,
      },
      fetchPolicy: "network-only",
    }
  );

  if (customerScoreList.loading) {
    return <Spinner />;
  }

  const data = customerScoreList.data?.burenCustomerScoringsMain;

  const updatedProps = {
    ...props,
    burenCustomerScorings:
      data?.list || [],
    totalCount:
      data?.totalCount || 0,
    refetch: customerScoreList.refetch(),
  };
  return <Section {...updatedProps} />;
}

export default BurenSectionContainer;

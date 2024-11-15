import React from "react";
import Component from "../components/List";
import { Alert, Bulk, confirm } from "@erxes/ui/src";
import { gql, useQuery, useMutation } from "@apollo/client";
import queries from "../graphql/queries";
import { QueryResponse } from "@erxes/ui/src/types";
import { IScoreCampaign } from "../types";
import mutations from "../graphql/mutations";
import { IBulkContentProps } from "@erxes/ui/src/components/Bulk";

export type ScoreCampaignsQueryResponse = {
  scoreCampaigns: IScoreCampaign[];
  scoreCampaignsTotalCount: number;
} & QueryResponse;

export default function List(props) {
  const { data, loading, refetch } = useQuery<ScoreCampaignsQueryResponse>(
    gql(queries.scoreCampaigns),
    {
      variables: { ...props?.queryParams }
    }
  );

  const [removeScoreCampaign] = useMutation(gql(mutations.removeCampaigns));

  const list = (bulkProps: IBulkContentProps) => {
    const onRemove = () => {
      confirm().then(() => {
        removeScoreCampaign({
          variables: { _ids: bulkProps.bulk }
        })
          .then(() => {
            Alert.success("Campaign successfully removed");
          })
          .catch((error) => {
            Alert.error(error.message);
          });
      });
    };
    const updatedProps = {
      ...props,
      ...bulkProps,
      refetch,
      loading,
      campaigns: data?.scoreCampaigns || [],
      totalCount: data?.scoreCampaignsTotalCount || 0,
      onRemove
    };

    return <Component {...updatedProps} />;
  };

  return <Bulk content={list} />;
}

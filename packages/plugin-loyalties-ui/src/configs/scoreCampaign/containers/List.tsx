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

  const { scoreCampaigns = [], scoreCampaignsTotalCount = 0 } = data || {};

  const [removeScoreCampaign] = useMutation(gql(mutations.removeCampaigns));
  const [changeScoreCampaignStatus] = useMutation(gql(mutations.update));

  const list = (bulkProps: IBulkContentProps) => {
    const onRemove = () => {
      confirm().then(() => {
        removeScoreCampaign({
          variables: { _ids: bulkProps.bulk.map(({ _id }) => _id) }
        })
          .then(() => {
            Alert.success("Campaign successfully removed");
            refetch();
            bulkProps.emptyBulk();
          })
          .catch((error) => {
            Alert.error(error.message);
          });
      });
    };

    const onChangeStatus = (_id: string, status: string) => {
      const campaign = scoreCampaigns.find((campaign) => campaign._id === _id);
      changeScoreCampaignStatus({
        variables: { ...campaign, status }
      }).then(() => {
        Alert.success("Successfully changed the status of the campaign");
        refetch();
      });
    };

    const updatedProps = {
      ...props,
      ...bulkProps,
      refetch,
      loading,
      campaigns: scoreCampaigns,
      totalCount: scoreCampaignsTotalCount,
      onRemove,
      onChangeStatus
    };

    return <Component {...updatedProps} />;
  };

  return <Bulk content={list} />;
}

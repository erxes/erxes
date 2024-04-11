import { Alert, router } from "@erxes/ui/src/utils";
import { Bulk, Spinner } from "@erxes/ui/src/components";
import { mutations, queries } from "../graphql";
import { useMutation, useQuery } from "@apollo/client";

import List from "../components/List";
import React from "react";
import { queries as campaignQueries } from "../../../configs/voucherCampaign/graphql";
import { gql } from "@apollo/client";

type Props = {
  queryParams: any;
};

const VoucherListContainer = ({ queryParams }: Props) => {
  const {
    loading: mainQueryLoading,
    data: mainQueryData,
    refetch: refetchMainQuery,
  } = useQuery(gql(queries.vouchersMain), {
    variables: generateParams(queryParams),
    fetchPolicy: "network-only",
  });

  const { loading: campaignQueryLoading, data: campaignQueryData } = useQuery(
    gql(campaignQueries.voucherCampaignDetail),
    {
      variables: { id: queryParams.campaignId },
      skip: !queryParams.campaignId,
    }
  );

  const [removeVouchers] = useMutation(gql(mutations.vouchersRemove), {
    refetchQueries: [
      "vouchersMain",
      "voucherCounts",
      "voucherCategories",
      "voucherCategoriesTotalCount",
    ],
  });

  const handleRemoveVouchers = ({ voucherIds }, emptyBulk) => {
    removeVouchers({ variables: { _ids: voucherIds } })
      .then(() => {
        emptyBulk();
        Alert.success("You successfully deleted a voucher");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  if (mainQueryLoading || campaignQueryLoading) {
    return <Spinner />;
  }

  const list = mainQueryData?.vouchersMain?.list || [];
  const totalCount = mainQueryData?.vouchersMain?.totalCount || 0;
  const currentCampaign = campaignQueryData?.voucherCampaignDetail;

  const updatedProps = {
    totalCount,
    searchValue: queryParams.searchValue || "",
    vouchers: list,
    currentCampaign,
    removeVouchers: handleRemoveVouchers,
  };

  const refetch = () => {
    refetchMainQuery();
  };

  const vouchersList = (props) => {
    return <List {...updatedProps} {...props} />;
  };

  return <Bulk content={vouchersList} refetch={refetch} />;
};

const generateParams = (queryParams) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  campaignId: queryParams.campaignId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
});

export default VoucherListContainer;

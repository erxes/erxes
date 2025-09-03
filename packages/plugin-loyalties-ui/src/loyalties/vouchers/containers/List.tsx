import { useMutation, useQuery } from "@apollo/client";
import { Alert, router } from "@erxes/ui/src/utils";
import { mutations, queries } from "../graphql";

import { gql } from "@apollo/client";
import React from "react";
import { queries as campaignQueries } from "../../../configs/voucherCampaign/graphql";
import List from "../components/List";

type Props = {
  queryParams: any;
};

const generateParams = (queryParams) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  campaignId: queryParams.campaignId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  fromDate: queryParams.fromDate,
  toDate: queryParams.toDate,
  sortField: queryParams.orderType,
  sortDirection: Number(queryParams.order) || undefined,
});

const VoucherListContainer = ({ queryParams }: Props) => {
  const { loading: mainQueryLoading, data: mainQueryData } = useQuery(
    gql(queries.vouchersMain),
    {
      variables: generateParams(queryParams),
      fetchPolicy: "network-only",
    }
  );

  const { data: campaignQueryData } = useQuery(
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

  const handleRemoveVouchers = ({ voucherIds }) => {
    removeVouchers({ variables: { _ids: voucherIds } })
      .then(() => {
        Alert.success("You successfully deleted a voucher");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const list = mainQueryData?.vouchersMain?.list || [];
  const totalCount = mainQueryData?.vouchersMain?.totalCount || 0;
  const currentCampaign = campaignQueryData?.voucherCampaignDetail;

  const updatedProps = {
    loading: mainQueryLoading,
    queryParams,
    totalCount,
    searchValue: queryParams.searchValue || "",
    vouchers: list,
    currentCampaign,
    removeVouchers: handleRemoveVouchers,
  };

  return <List {...updatedProps} />;
};

export default VoucherListContainer;

import Alert from "@erxes/ui/src/utils/Alert";
import CheckSyncedDeals from "../components/syncedDeals/CheckSyncedDeals";
import { gql } from "@apollo/client";
import React, { useState } from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { Bulk } from "@erxes/ui/src/components";
import {
  CheckSyncedDealsQueryResponse,
  CheckSyncedDealsTotalCountQueryResponse,
  CheckSyncedMutationResponse,
} from "../types";
import { mutations, queries } from "../graphql";
import { router } from "@erxes/ui/src/utils/core";
import { useQuery, useMutation } from "@apollo/client";

type Props = {
  queryParams: any;
};

const CheckSyncedDealsContainer = (props: Props) => {
  const { queryParams } = props;

  const [toMultiCheckSynced] = useMutation<CheckSyncedMutationResponse>(
    gql(mutations.toCheckSynced)
  );

  const [toMultiSyncDeals] = useMutation(gql(mutations.toSyncDeals));

  const checkSyncItemsQuery = useQuery<CheckSyncedDealsQueryResponse>(
    gql(queries.checkSyncDeals),
    {
      variables: generateParams({ queryParams }),
      fetchPolicy: "network-only",
    }
  );

  const checkSyncedDealsTotalCountQuery =
    useQuery<CheckSyncedDealsTotalCountQueryResponse>(
      gql(queries.checkSyncDealsTotalCount),
      {
        variables: generateParams({ queryParams }),
        fetchPolicy: "network-only",
      }
    );

  const [unSyncedDealIds, setUnSyncedDealIds] = useState([] as string[]);
  const [syncedDealInfos, setSyncedDealInfos] = useState({});

  // remove action
  const checkSynced = async ({ dealIds }, emptyBulk) => {
    await toMultiCheckSynced({
      variables: { ids: dealIds, type: "deal" },
    })
      .then((response) => {
        emptyBulk();
        const items = response?.data?.toMultiCheckSynced || ([] as any);
        const unSyncedDealIds: string[] = items
          .filter((item) => {
            const brands = item.mustBrands || [];
            for (const b of brands) {
              if (!item[b]) {
                return true;
              }
            }
            return false;
          })
          .map((i) => i._id);

        const syncedDealInfos: any[] = [];

        items.forEach((item) => {
          syncedDealInfos[item._id] = item;
        });
        setUnSyncedDealIds(unSyncedDealIds);
        setSyncedDealInfos(syncedDealInfos);
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const toSyncDeals = (dealIds, configStageId, dateType) => {
    toMultiSyncDeals({
      variables: { dealIds, configStageId, dateType },
    })
      .then((response) => {
        const { skipped, error, success } = response?.data?.toSyncDeals;
        const changed = unSyncedDealIds.filter((u) => !dealIds.includes(u));
        setUnSyncedDealIds(changed);
        Alert.success(
          `Алгассан: ${skipped.length}, Алдаа гарсан: ${error.length}, Амжилттай: ${success.length}`
        );
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  if (checkSyncItemsQuery.loading || checkSyncedDealsTotalCountQuery.loading) {
    return <Spinner />;
  }

  const deals = checkSyncItemsQuery?.data?.deals || [];
  const totalCount =
    checkSyncedDealsTotalCountQuery?.data?.dealsTotalCount || 0;

  const updatedProps = {
    ...props,
    loading: checkSyncItemsQuery.loading,
    deals,
    totalCount,
    checkSynced,
    unSyncedDealIds: unSyncedDealIds,
    syncedDealInfos: syncedDealInfos,
    toSyncDeals,
  };

  const content = (props) => <CheckSyncedDeals {...props} {...updatedProps} />;

  return <Bulk content={content} />;
};

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    limit: pageInfo.perPage || 10,
    skip: pageInfo.page > 1 ? (pageInfo.page - 1) * pageInfo.perPage : 0,
    pipelineId: queryParams.pipelineId,
    noSkipArchive: true,
    stageId: queryParams.stageId,
    stageChangedStartDate: queryParams.stageChangedStartDate,
    stageChangedEndDate: queryParams.stageChangedEndDate,
    assignedUserIds: queryParams.userId && [queryParams.userId],
    search: queryParams.search,
    number: queryParams.number,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
  };
};

export default CheckSyncedDealsContainer;

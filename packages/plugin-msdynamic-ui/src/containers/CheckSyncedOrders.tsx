import * as compose from "lodash.flowright";

import {
  CheckSyncedMutationResponse,
  CheckSyncedOrdersQueryResponse,
  CheckSyncedOrdersTotalCountQueryResponse,
  PosListQueryResponse,
  ToSendOrdersMutationResponse,
} from "../types";
import React, { useState } from "react";
import { mutations, queries } from "../graphql";
import { router, withProps } from "@erxes/ui/src/utils/core";

import Alert from "@erxes/ui/src/utils/Alert";
import { Bulk } from "@erxes/ui/src/components";
import CheckSyncedOrders from "../components/syncedOrders/CheckSyncedOrders";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";

type Props = {
  queryParams: any;
};

type FinalProps = {
  checkSyncItemsQuery: CheckSyncedOrdersQueryResponse;
  checkSyncedOrdersTotalCountQuery: CheckSyncedOrdersTotalCountQueryResponse;
  posListQuery: PosListQueryResponse;
} & Props &
  CheckSyncedMutationResponse &
  ToSendOrdersMutationResponse;

const CheckSyncedOrdersContainer = (props: FinalProps) => {
  const [unSyncedOrderIds, setUnSyncedOrderIds] = useState([]);
  const [syncedOrderInfos, setSyncedOrderInfos] = useState({});

  const {
    toCheckMsdSynced,
    checkSyncItemsQuery,
    checkSyncedOrdersTotalCountQuery,
    posListQuery,
  } = props;

  // remove action
  const checkSynced = async ({ orderIds }, emptyBulk) => {
    await toCheckMsdSynced({
      variables: { ids: orderIds, brandId: props.queryParams.brandId },
    })
      .then((response) => {
        emptyBulk();
        const statuses = response.data.toCheckMsdSynced;

        const unSyncedOrderIds = (
          statuses.filter((s) => !s.isSynced) || []
        ).map((s) => s._id);
        const syncedOrderInfos = {};
        const syncedOrders = statuses.filter((s) => s.isSynced) || [];

        syncedOrders.forEach((item) => {
          syncedOrderInfos[item._id] = {
            syncedBillNumber: item.syncedBillNumber || "",
            syncedDate: item.syncedDate || "",
            syncedCustomer: item.syncedCustomer || "",
          };
        });

        setUnSyncedOrderIds(unSyncedOrderIds);
        setSyncedOrderInfos(syncedOrderInfos);
        Alert.success("Check finished");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const toSendMsdOrders = (orderIds) => {
    props
      .toSendMsdOrders({
        variables: { orderIds },
      })
      .then((response) => {
        const { _id, syncedBillNumber, syncedDate, syncedCustomer } =
          response.data.toSendMsdOrders;

        const syncedOrderInfos = {};

        syncedOrderInfos[_id] = {
          syncedBillNumber: syncedBillNumber || "",
          syncedDate: syncedDate || "",
          syncedCustomer: syncedCustomer || "",
        };

        setSyncedOrderInfos(syncedOrderInfos);

        Alert.success("Successful");
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const orders = checkSyncItemsQuery.posOrders || [];
  const totalCount = checkSyncedOrdersTotalCountQuery.posOrdersTotalCount || 0;

  const updatedProps = {
    ...props,
    loading: checkSyncItemsQuery.loading,
    orders,
    totalCount,
    checkSynced,
    unSyncedOrderIds: unSyncedOrderIds,
    syncedOrderInfos: syncedOrderInfos,
    toSendMsdOrders,
    posList: posListQuery.posList,
  };

  const content = (props) => <CheckSyncedOrders {...props} {...updatedProps} />;

  return <Bulk content={content} />;
};

const generateParams = ({ queryParams }) => {
  const pageInfo = router.generatePaginationParams(queryParams || {});

  return {
    paidStartDate: queryParams.paidStartDate,
    paidEndDate: queryParams.paidEndDate,
    createdStartDate: queryParams.createdStartDate,
    createdEndDate: queryParams.createdEndDate,
    userId: queryParams.user,
    brandId: queryParams.brandId,
    search: queryParams.search,
    sortField: queryParams.sortField,
    sortDirection: Number(queryParams.sortDirection) || undefined,
    page: queryParams.page ? parseInt(queryParams.page, 10) : 1,
    perPage: queryParams.perPage ? parseInt(queryParams.perPage, 10) : 20,
  };
};

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }, CheckSyncedOrdersQueryResponse>(
      gql(queries.checkSyncOrders),
      {
        name: "checkSyncItemsQuery",
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: "network-only",
        }),
      }
    ),

    graphql<{ queryParams: any }, CheckSyncedOrdersTotalCountQueryResponse>(
      gql(queries.checkSyncOrdersTotalCount),
      {
        name: "checkSyncedOrdersTotalCountQuery",
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: "network-only",
        }),
      }
    ),
    graphql<Props, CheckSyncedMutationResponse, { orderIds: string[] }>(
      gql(mutations.toCheckMsdSynced),
      {
        name: "toCheckMsdSynced",
      }
    ),
    graphql<Props, ToSendOrdersMutationResponse, { orderIds: string[] }>(
      gql(mutations.toSendMsdOrders),
      {
        name: "toSendMsdOrders",
      }
    ),

    graphql<{ queryParams: any }, PosListQueryResponse>(
      gql(`query posList {
        posList {
          _id
          name
          description
        }
      }`),
      {
        name: "posListQuery",
      }
    )
  )(CheckSyncedOrdersContainer)
);

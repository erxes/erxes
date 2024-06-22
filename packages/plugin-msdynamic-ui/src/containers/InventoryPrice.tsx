import * as compose from "lodash.flowright";

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Alert from "@erxes/ui/src/utils/Alert";
import { Bulk } from "@erxes/ui/src/components";
import InventoryPrices from "../components/price/InventoryPrice";
import Spinner from "@erxes/ui/src/components/Spinner";
import { ToSyncPricesMutationResponse } from "../types";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "../graphql";
import { router } from "@erxes/ui/src";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props & ToSyncPricesMutationResponse;

const InventoryPriceContainer = (props: FinalProps) => {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);
  const brandId = props.queryParams.brandId || "noBrand";
  const location = useLocation();
  const navigate = useNavigate();

  const setBrand = (brandId: string) => {
    router.setParams(navigate, location, { brandId: brandId });
    return router;
  };

  if (loading) {
    return <Spinner />;
  }

  const setSyncStatus = (data: any, action: string) => {
    const createData = data[action].items.map((d) => ({
      ...d,
      syncStatus: false,
    }));
    data[action].items = createData;

    return data;
  };

  const toSyncPrices = () => {
    setLoading(true);
    props
      .toSyncMsdPrices({
        variables: { brandId },
      })
      .then((response) => {
        const data = response.data.toSyncMsdPrices;

        setSyncStatus(data, "create");
        setSyncStatus(data, "update");
        setSyncStatus(data, "match");
        setSyncStatus(data, "delete");
        setSyncStatus(data, "error");

        setItems(response.data.toSyncMsdPrices);
        setLoading(false);
      })
      .catch((e) => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const updatedProps = {
    ...props,
    loading,
    items,
    setBrand,
    toSyncPrices,
  };

  const content = () => <InventoryPrices {...updatedProps} />;

  return <Bulk content={content} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ToSyncPricesMutationResponse, {}>(
      gql(mutations.toSyncPrices),
      {
        name: "toSyncMsdPrices",
      }
    )
  )(InventoryPriceContainer)
);

import * as compose from "lodash.flowright";

import React, { useState } from "react";
import {
  ToCheckCustomersMutationResponse,
  ToSyncCustomersMutationResponse,
} from "../types";
import { useLocation, useNavigate } from "react-router-dom";

import Alert from "@erxes/ui/src/utils/Alert";
import { Bulk } from "@erxes/ui/src/components";
import Customers from "../components/customers/Customers";
import Spinner from "@erxes/ui/src/components/Spinner";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { mutations } from "../graphql";
import { router } from "@erxes/ui/src";
import { withProps } from "@erxes/ui/src/utils";

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props &
  ToCheckCustomersMutationResponse &
  ToSyncCustomersMutationResponse;

const CustomersContainer = (props: FinalProps) => {
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

  const setSyncStatusTrue = (data: any, customers: any, action: string) => {
    data[action].items = data[action].items.map((i) => {
      if (customers.find((c) => c.No === i.No)) {
        const temp = i;
        temp.syncStatus = true;
        return temp;
      }
      return i;
    });
  };

  const setSyncStatus = (data: any, action: string) => {
    const createData = data[action].items.map((d) => ({
      ...d,
      syncStatus: false,
    }));
    data[action].items = createData;

    return data;
  };

  const toCheckCustomers = () => {
    setLoading(true);
    props
      .toCheckMsdCustomers({
        variables: { brandId },
      })
      .then((response) => {
        const data = response.data.toCheckMsdCustomers;

        setSyncStatus(data, "create");
        setSyncStatus(data, "update");
        setSyncStatus(data, "delete");

        setItems(response.data.toCheckMsdCustomers);
        setLoading(false);
      })
      .catch((e) => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const toSyncCustomers = (action: string, customers: any[]) => {
    setLoading(true);
    props
      .toSyncMsdCustomers({
        variables: {
          brandId,
          action,
          customers,
        },
      })
      .then(() => {
        setLoading(false);
        Alert.success("Success. Please check again.");
      })
      .finally(() => {
        const data = items;

        setSyncStatusTrue(data, customers, action.toLowerCase());
        setItems(data);
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
    toCheckCustomers,
    toSyncCustomers,
  };

  const content = () => <Customers {...updatedProps} />;

  return <Bulk content={content} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ToCheckCustomersMutationResponse, {}>(
      gql(mutations.toCheckCustomers),
      {
        name: "toCheckMsdCustomers",
      }
    ),
    graphql<Props, ToSyncCustomersMutationResponse, {}>(
      gql(mutations.toSyncCustomers),
      {
        name: "toSyncMsdCustomers",
      }
    )
  )(CustomersContainer)
);

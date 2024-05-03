import { gql } from "@apollo/client";
import * as compose from "lodash.flowright";
import { graphql } from "@apollo/client/react/hoc";
import { withProps } from "@erxes/ui/src/utils";
import {
  ToCheckCategoriesMutationResponse,
  ToSyncCategoriesMutationResponse,
} from "../types";
import { router } from "@erxes/ui/src";
import { Bulk } from "@erxes/ui/src/components";
import Alert from "@erxes/ui/src/utils/Alert";
import { mutations } from "../graphql";
import React, { useState } from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import InventoryCategory from "../components/category/InventoryCategory";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props &
  ToCheckCategoriesMutationResponse &
  ToSyncCategoriesMutationResponse;

const InventoryCategoryContainer = (props: FinalProps) => {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);
  const brandId = props.queryParams.brandId || "noBrand";
  const categoryId = props.queryParams.categoryId || "noCategory";
  const location = useLocation();
  const navigate = useNavigate();

  const setBrand = (brandId: string) => {
    router.setParams(navigate, location, { brandId: brandId });
    return router;
  };

  const setCategory = (categoryId: string) => {
    router.setParams(navigate, location, { categoryId: categoryId });
    return router;
  };

  if (loading) {
    return <Spinner />;
  }

  const setSyncStatusTrue = (data: any, categories: any, action: string) => {
    data[action].items = data[action].items.map((i) => {
      if (categories.find((c) => c.Code === i.Code)) {
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

  const toCheckCategory = () => {
    setLoading(true);
    props
      .toCheckMsdProductCategories({
        variables: { brandId, categoryId },
      })
      .then((response) => {
        const data = response.data.toCheckMsdProductCategories;

        setSyncStatus(data, "create");
        setSyncStatus(data, "update");
        setSyncStatus(data, "delete");

        setItems(response.data.toCheckMsdProductCategories);
        setLoading(false);
      })
      .catch((e) => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const toSyncCategory = (action: string, categories: any[]) => {
    setLoading(true);
    props
      .toSyncMsdProductCategories({
        variables: {
          brandId,
          action,
          categoryId,
          categories,
        },
      })
      .then(() => {
        setLoading(false);
        Alert.success("Success. Please check again.");
      })
      .finally(() => {
        const data = items;

        setSyncStatusTrue(data, categories, action.toLowerCase());
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
    setCategory,
    setBrand,
    toCheckCategory,
    toSyncCategory,
  };

  const content = () => <InventoryCategory {...updatedProps} />;

  return <Bulk content={content} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ToCheckCategoriesMutationResponse, {}>(
      gql(mutations.toCheckCategories),
      {
        name: "toCheckMsdProductCategories",
      }
    ),
    graphql<Props, ToSyncCategoriesMutationResponse, {}>(
      gql(mutations.toSyncCategories),
      {
        name: "toSyncMsdProductCategories",
      }
    )
  )(InventoryCategoryContainer)
);

import { AssetEditMutationResponse, IAsset } from "../../../common/types";
import { gql, useMutation, useQuery } from "@apollo/client";

import { FieldsGroupsQueryResponse } from "@erxes/ui-forms/src/settings/properties/types";
import GenerateCustomFields from "@erxes/ui-forms/src/settings/properties/components/GenerateCustomFields";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import Spinner from "@erxes/ui/src/components/Spinner";
import { queries as fieldQueries } from "@erxes/ui-forms/src/settings/properties/graphql";
import { isEnabled } from "@erxes/ui/src/utils/core";
import { mutations } from "../../graphql";

type Props = {
  asset: IAsset;
  loading?: boolean;
};

const CustomFieldSectionContainer = (props: Props) => {
  const { loading, asset } = props;

  const fieldsGroupsQuery = useQuery<FieldsGroupsQueryResponse>(
    gql(fieldQueries.fieldsGroups),
    {
      variables: {
        contentType: "assets:asset",
        isDefinedByErxes: false
      }
    }
  );

  const [editMutation] = useMutation<AssetEditMutationResponse>(
    gql(mutations.assetEdit),
    {
      refetchQueries: ["assetDetailQuery"]
    }
  );

  if (fieldsGroupsQuery && fieldsGroupsQuery.loading) {
    return (
      <Sidebar full={true}>
        <Spinner />
      </Sidebar>
    );
  }

  const save = (data, callback) => {
    editMutation({
      variables: { ...asset, ...data }
    })
      .then(() => {
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    save,
    loading,
    customFieldsData: asset.customFieldsData,
    fieldsGroups:
      (fieldsGroupsQuery && fieldsGroupsQuery?.data?.fieldsGroups) || [],
    isDetail: true,
    object: asset
  };

  return <GenerateCustomFields {...updatedProps} />;
};

export default CustomFieldSectionContainer;

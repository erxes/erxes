import { Alert } from "@erxes/ui/src/utils";
import {
  ConfigsResponse,
  CustomerFieldsResponse,
  IConfigsMaps
} from "../../types";
import { mutations, queries } from "../../graphql";

import { useQuery, useMutation, gql } from "@apollo/client";
import React from "react";

type Props = {
  component: any;
  configCode: string;
};
type FinalProps = {
  configsQuery: ConfigsResponse;
  updateConfigs: (configsMap: IConfigsMaps) => Promise<void>;
} & Props;

export default function SettingsContainer(props: FinalProps) {
  const { data, loading, refetch } = useQuery<ConfigsResponse>(
    gql(queries.BurenConfigs),
    {
      fetchPolicy: "network-only"
    }
  );

  const customFields = useQuery<CustomerFieldsResponse>(
    gql(queries.fieldsCombinedByContentType),

    {
      variables: {
        contentType: "core:customer"
      },
      fetchPolicy: "network-only"
    }
  );
  const [updateConfigs] = useMutation(gql(mutations.updateScoringConfigs));
  // create or update action
  const save = (map: IConfigsMaps) => {
    updateConfigs({
      variables: { configsMap: map }
    })
      .then(() => {
        refetch();

        Alert.success("You successfully updated scoring config");
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const configs = data?.configs || [];

  const configsMap = {};

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  const Component = props.component;
  const updatedProps = {
    ...props,
    configsMap,
    save,
    loading: loading,
    customFields: customFields?.data || []
  };
  if (loading) return null;
  return <Component {...updatedProps} />;
}

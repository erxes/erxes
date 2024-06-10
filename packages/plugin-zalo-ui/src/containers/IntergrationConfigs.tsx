import { gql, useQuery, useMutation } from "@apollo/client";
import React from "react";
import { Alert } from "@erxes/ui/src/utils";
import Spinner from "@erxes/ui/src/components/Spinner";
import Settings from "../components/IntegrationSettings";
import { mutations, queries } from "../graphql";
import { IConfigsMap } from "@erxes/ui-settings/src/general/types";

type Props = {
  history: any;
};

const ConfigsContainer = (props: Props) => {
  const getConfigsQuery = useQuery(gql(queries.zaloGetConfigs), {
    fetchPolicy: "network-only",
    variables: { kind: "zalo" },
  });

  const [updateConfigsMutation] = useMutation(gql(mutations.zaloUpdateConfigs));

  if (getConfigsQuery.loading) {
    return <Spinner />;
  }

  const configs = getConfigsQuery?.data?.zaloGetConfigs;
  const configsMap = {};

  console.log("configs", configs, getConfigsQuery);

  for (const config of configs) {
    configsMap[config.code] = config.value;
  }

  const updateConfigs = (value: IConfigsMap) => {
    updateConfigsMutation({ variables: { configsMap: value } })
      .then(() => {
        Alert.success("Successfully updated configs");
        getConfigsQuery.refetch();
      })
      .catch(e => Alert.error(e.message));
  };

  const updatedProps = {
    loading: getConfigsQuery.loading,
    updateConfigs,
    configsMap,
  };

  return <Settings {...updatedProps} />;
};

export default ConfigsContainer;

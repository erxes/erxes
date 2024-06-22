import { getEnv, withProps } from "@erxes/ui/src/utils";

import Home from "../components/store/Home";
import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";
import { gql } from "@apollo/client";
import { queries } from "@erxes/ui-inbox/src/settings/integrations/graphql";
import { useQuery } from "@apollo/client";

type Props = {
  queryParams: any;
  history?: any;
};

const Store = (props: Props) => {
  const { loading, error, data } = useQuery(gql(queries.integrationTotalCount));

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    // Handle error, for now just logging it
    console.error("Error fetching data:", error);
    return null;
  }

  const customLink = (kind: string, addLink: string) => {
    const { REACT_APP_API_URL } = getEnv();
    const url = `${REACT_APP_API_URL}/connect-integration?link=${addLink}&kind=${kind}`;
    window.location.replace(url);
  };

  const totalCount = data?.integrationsTotalCount?.byKind || {};

  const updatedProps = {
    ...props,
    customLink,
    totalCount,
  };

  return <Home {...updatedProps} />;
};

export default Store;

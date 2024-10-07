import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { queries } from "../graphql";
import SidebarView from "../components/SidebarView";

import React from "react";
import Spinner from "@erxes/ui/src/components/Spinner";

type Props = {
  id: string;
  mainType: string;
};
const getContentType = (mainType) => {
  if (mainType === "customer") return "contacts:customer";
  if (mainType.includes(":")) return mainType;
  return `default:${mainType}`;
};
const SidebarViewContainer = (props: Props) => {
  const contentType = getContentType(props.mainType);
  const xypData = useQuery(gql(queries.xypDataByObject), {
    variables: {
      contentTypeId: props.id,
      contentType,
    },
    fetchPolicy: "network-only",
  });


  if (xypData.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    ...props,
    xypData,
    loading: xypData.loading
  };

  return <SidebarView {...updatedProps} />;
};

export default SidebarViewContainer;

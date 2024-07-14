import React from "react";
import { gql, useQuery } from "@apollo/client";
import { queries } from "../../../../graphql";
import Spinner from "@erxes/ui/src/components/Spinner";
import Workflow from "../../../../components/forms/actions/subForms/WorkFlow";

type Props = {
  triggerType: string;
};

export default function WorkFlow({ triggerType }: Props) {
  const {
    data = {},
    loading,
    error,
  } = useQuery(gql(queries.automations), {
    variables: { triggerTypes: [triggerType] },
  });

  if (loading) {
    return <Spinner objective />;
  }

  const updatedProps = {
    list: data?.automations || [],
  };

  return <Workflow {...updatedProps} />;
}

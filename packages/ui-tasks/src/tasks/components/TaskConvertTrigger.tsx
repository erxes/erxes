import ConvertTrigger from "../../boards/components/portable/ConvertTrigger";
import { __ } from "@erxes/ui/src/utils";
import React from "react";
import options from "../options";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client";
import { queries } from "../graphql";

type Props = {
  relType: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
  sourceConversationId?: string;
  description?: string;
  attachments?: any[];
  
};

export default (props: Props) => {
  const { data, refetch } = useQuery(gql(queries.convertToInfo), {
    variables: { conversationId: props.sourceConversationId }
  });

  const url = data?.tasksConvertToInfo?.taskUrl || "";

  const title = url ? __("Go to a task") : __("Convert to a task");

  const extendedProps = {
    ...props,
    url,
    options,
    refetch,
    title,
    autoOpenKey: "showTaskConvertModal"
  };

  return <ConvertTrigger {...extendedProps} />;
};

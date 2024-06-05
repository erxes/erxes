import { gql, useQuery } from "@apollo/client";
import React from "react";
import Histories from "../components/histories/Histories";
import { queries } from "../graphql";
import {
  AutomationHistoriesQueryResponse,
  IAutomation,
  ITrigger,
} from "../types";

type Props = {
  automation: IAutomation;
  filterParams: {
    page?: number;
    perPage?: number;
    status?: string;
    triggerId?: string;
    triggerType?: string;
    beginDate?: Date;
    endDate?: Date;
  };
  triggersConst: ITrigger[];
  actionsConst: any[];
};

function HistoriesContainer(props: Props) {
  const { automation, filterParams, triggersConst, actionsConst } = props;

  const automationHistoriesQuery = useQuery<AutomationHistoriesQueryResponse>(
    gql(queries.automationHistories),
    {
      variables: {
        automationId: automation._id,
        ...filterParams,
      },
      fetchPolicy: "network-only",
    }
  );

  if (automationHistoriesQuery.loading) {
    return null;
  }

  const histories = automationHistoriesQuery?.data?.automationHistories || [];

  return (
    <Histories
      histories={histories}
      triggersConst={triggersConst}
      actionsConst={actionsConst}
    />
  );
}

export default HistoriesContainer;

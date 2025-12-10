import React from "react";
import { gql, useQuery, DocumentNode } from "@apollo/client";

import GoalTypeForm from "../containers/goalForm";
import GoalView from "./goalView";
import queries from "../graphql/queries"; 
import { IGoalType } from "../types";

type GoalEntity = "task" | "ticket" | "purchase" | "deal";

// Fix: Use type assertions for GraphQL queries
const pipelineQueryMap: Record<GoalEntity, DocumentNode> = {
  task: gql(queries.tasksPipelineDetail as string),
  ticket: gql(queries.ticketsPipelineDetail as string),
  purchase: gql(queries.purchasesPipelineDetail as string),
  deal: gql(queries.salesPipelineDetail as string)
};

const boardQueryMap: Record<GoalEntity, DocumentNode> = {
  task: gql(queries.tasksBoardDetail as string),
  ticket: gql(queries.ticketsBoardDetail as string),
  purchase: gql(queries.purchasesBoardDetail as string),
  deal: gql(queries.salesBoardDetail as string)
};

const stageQueryMap: Record<GoalEntity, DocumentNode> = {
  task: gql(queries.tasksStageDetail as string),
  ticket: gql(queries.ticketsStageDetail as string),
  purchase: gql(queries.purchasesStageDetail as string),
  deal: gql(queries.salesStageDetail as string)
};

type Props = {
  goalType: IGoalType;
  onDelete: (id: string) => void;
  onEdit: (goalType: IGoalType) => void;
};

const GoalRow = ({ goalType, onDelete, onEdit }: Props) => {
  const entity = goalType.entity as GoalEntity;

  const { data: pipelineData } = useQuery(
    pipelineQueryMap[entity],
    {
      variables: { _id: goalType.pipelineId },
      skip: !goalType.pipelineId
    }
  );

  const { data: boardData } = useQuery(
    boardQueryMap[entity],
    {
      variables: { _id: goalType.boardId },
      skip: !goalType.boardId
    }
  );

  const { data: stageData } = useQuery(
    stageQueryMap[entity],
    {
      variables: { _id: goalType.stageId },
      skip: !goalType.stageId
    }
  );

  return (
    <GoalView
      goalType={goalType}
      boardName={boardData?.boardDetail?.name}
      pipelineName={pipelineData?.pipelineDetail?.name}
      stageName={stageData?.stageDetail?.name}
      onEdit={onEdit}
    />
  );
};

export default GoalRow;
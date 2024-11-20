import { gql, useQuery } from "@apollo/client";
import {
  ActionButtons,
  Button,
  formatValue,
  FormControl,
  ModalTrigger
} from "@erxes/ui/src";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import GoalTypeForm from "../containers/goalForm";
import { queries } from "../graphql";
import { IGoalType } from "../types";
import GoalView from "./goalView";

type Props = {
  goalType: IGoalType;
  isChecked: boolean;
  toggleBulk: (goalType: IGoalType, isChecked?: boolean) => void;
};

function displayValue(goalType, name) {
  const value = _.get(goalType, name);

  return formatValue(value);
}

function renderFormTrigger(trigger: React.ReactNode, goalType: IGoalType) {
  const content = (props) => (
    <GoalTypeForm
      {...props}
      goalType={goalType}
    />
  );
  return (
    <ModalTrigger
      size='lg'
      title='Edit Goal type'
      trigger={trigger}
      content={content}
    />
  );
}
function renderFormTViewier(
  trigger: React.ReactNode,
  goalType: IGoalType,
  boardName: string,
  pipelineName: string,
  stageName: string,
  emailName: string
) {}

function renderEditAction(goalType: IGoalType) {
  const trigger = (
    <Button
      btnStyle='link'
      icon='edit-3'
    />
  );
  return renderFormTrigger(trigger, goalType);
}
function renderViewAction(
  goalType: IGoalType,
  boardName: string,
  pipelineName: string,
  stageName: string,
  emailName: string
) {
  const trigger = (
    <Button
      btnStyle='link'
      icon='eye'
    />
  );
  return renderFormTViewier(
    trigger,
    goalType,
    boardName,
    pipelineName,
    stageName,
    emailName
  );
}

function GoalRow({ goalType, isChecked, toggleBulk }: Props) {
  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(goalType, e.target.checked);
    }
  };
  const onClick = (e) => {
    e.stopPropagation();
  };
  const [pipelineName, setPipelineName] = useState("");
  const [boardName, setBoardName] = useState("");
  const [stageName, setStageName] = useState("");
  const [emailName, setEmail] = useState("");
  const pipelineQueryMap = {
    task: gql(queries.tasksPipelineDetail),
    ticket: gql(queries.ticketsPipelineDetail),
    purchase: gql(queries.purchasesPipelineDetail),
    deal: gql(queries.salesPipelineDetail)
  };
  const boardQueryMap = {
    task: gql(queries.tasksBoardDetail),
    ticket: gql(queries.ticketsBoardDetail),
    purchase: gql(queries.purchasesBoardDetail),
    deal: gql(queries.salesBoardDetail)
  };
  const stageQueryMap = {
    task: gql(queries.tasksStageDetail),
    ticket: gql(queries.ticketsStageDetail),
    purchase: gql(queries.purchasesStageDetail),
    deal: gql(queries.salesStageDetail)
  };
  const boardDetail = useQuery(boardQueryMap[goalType.entity], {
    variables: { _id: goalType.boardId },
    skip: !goalType.boardId
  });
  const pipelineDetail = useQuery(pipelineQueryMap[goalType.entity], {
    variables: { _id: goalType.pipelineId },
    skip: !goalType.pipelineId
  });

  const stageDetail = useQuery(stageQueryMap[goalType.entity], {
    variables: { _id: goalType.stageId },
    skip: !goalType.stageId
  });

  const userDetail = useQuery(gql(queries.userDetail), {
    variables: {
      _id: goalType.contribution[0]
    },
    skip: !goalType.contribution[0]
  });

  useEffect(() => {
    // Set email if user data is available
    if (userDetail.data?.userDetail) {
      setEmail(userDetail.data.userDetail.email);
    }

    // Helper function to get board data based on entity type
    const getBoardData = () => {
      switch (goalType.entity) {
        case "deal":
          return boardDetail.data.salesBoardDetail;
        case "task":
          return boardDetail.data.tasksBoardDetail;
        case "purchase":
          return boardDetail.data.purchasesBoardDetail;
        case "ticket":
          return boardDetail.data.ticketsBoardDetail;
        default:
          return null;
      }
    };

    // Set board name if board data is available
    const boardData = boardDetail.data ? getBoardData() : null;
    if (boardData) {
      setBoardName(boardData.name);
    }

    // Helper function to get pipeline data based on entity type
    const getPipelineData = () => {
      switch (goalType.entity) {
        case "deal":
          return pipelineDetail.data.salesPipelineDetail;
        case "task":
          return pipelineDetail.data.tasksPipelineDetail;
        case "purchase":
          return pipelineDetail.data.purchasesPipelineDetail;
        case "ticket":
          return pipelineDetail.data.ticketsPipelineDetail;
        default:
          return null;
      }
    };

    // Set pipeline name if pipeline data is available
    const pipelineData = pipelineDetail.data ? getPipelineData() : null;
    if (pipelineData) {
      setPipelineName(pipelineData.name);
    }

    // Helper function to get stage data based on entity type
    const getStageData = () => {
      switch (goalType.entity) {
        case "deal":
          return stageDetail.data.salesStageDetail;
        case "task":
          return stageDetail.data.tasksStageDetail;
        case "purchase":
          return stageDetail.data.purchasesStageDetail;
        case "ticket":
          return stageDetail.data.ticketsStageDetail;
        default:
          return null;
      }
    };

    // Set stage name if stage data is available
    const stageData = stageDetail.data ? getStageData() : null;
    if (stageData) {
      setStageName(stageData.name);
    }
  }, [
    pipelineDetail.data,
    boardDetail.data,
    stageDetail.data,
    userDetail.data
  ]);

  // Return null if any data is loading
  if (
    pipelineDetail.loading ||
    boardDetail.loading ||
    stageDetail.loading ||
    userDetail.loading
  ) {
    return null;
  }

  // Return null if any data is loading
  if (
    pipelineDetail.loading ||
    boardDetail.loading ||
    stageDetail.loading ||
    userDetail.loading
  ) {
    return null;
  }

  return (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass='checkbox'
          onChange={onChange}
        />
      </td>
      <td key={"name"}>{displayValue(goalType, "name")}</td>
      <td key={"entity"}>{displayValue(goalType, "entity")}</td>
      <td>{boardName}</td>
      <td>{pipelineName}</td>
      <td>{stageName}</td>
      <td key={"contributionType"}>
        {" "}
        {displayValue(goalType, "contributionType")}
      </td>
      <td key={"metric"}>{displayValue(goalType, "metric")}</td>
      <td key={"startDate"}>{displayValue(goalType, "startDate")}</td>
      <td key={"endDate"}>{displayValue(goalType, "endDate")}</td>
      <td>
        <ActionButtons>{renderEditAction(goalType)}</ActionButtons>
      </td>
    </tr>
  );
}

export default GoalRow;

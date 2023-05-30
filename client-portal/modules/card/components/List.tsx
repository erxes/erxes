import { Config, IUser } from "../../types";
import React, { useEffect, useState } from "react";
import { capitalize, getConfigColor } from "../../common/utils";
import { duedateFilter, priorityFilter } from "../../main/constants";

import BoardView from "./BoardView";
import { Card } from "react-bootstrap";
import Detail from "../containers/Detail";
import Form from "../containers/Form";
import Group from "../containers/Group";
import { GroupList } from "../../styles/cards";
import ListHeader from "./ListHeader";
import { renderUserFullName } from "../../utils";
import { useRouter } from "next/router";

type Props = {
  currentUser: IUser;
  config: Config;
  stages: any;
  type: string;
  pipeLinelabels: any;
  pipelineAssignedUsers: any;
};

export default function List({
  currentUser,
  config,
  stages,
  type,
  pipeLinelabels,
  pipelineAssignedUsers,
}: Props) {
  const router = useRouter();
  const { itemId, stageId } = router.query as any;

  const [mode, setMode] = useState("stage");
  const [viewType, setViewType] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [activeStageId, setStageId] = useState(
    stageId ? stageId : stages.stages[0]._id
  );

  useEffect(() => {
    setStageId(stageId);
  }, [stageId]);

  if (itemId) {
    return (
      <Detail
        _id={itemId}
        onClose={() => router.push(`/${type}s`)}
        currentUser={currentUser}
        config={config}
        type={type}
      />
    );
  }

  const renderGroup = (items, groupType: string) => {
    if (!items || items.length === 0) {
      return null;
    }

    return (items || []).map((item, index) => (
      <GroupList key={index}>
        <Card.Header>
          {groupType === "user" ? renderUserFullName(item.details) : item.name}
        </Card.Header>
        <Group groupType={groupType} type={type} id={item._id} />
      </GroupList>
    ));
  };

  const renderContent = () => {
    if (viewType === "board") {
      return (
        <BoardView
          stages={stages.stages}
          stageId={activeStageId}
          currentUser={currentUser}
          config={config}
          type={type}
          groupType={mode}
          viewType={viewType}
        />
      );
    }

    switch (mode) {
      case "stage":
        return renderGroup(stages?.stages, "stage");
      case "label":
        return renderGroup(pipeLinelabels?.pipelineLabels, "label");
      case "duedate":
        return renderGroup(duedateFilter, "duedate");
      case "priority":
        return renderGroup(priorityFilter, "priority");
      case "user":
        return renderGroup(pipelineAssignedUsers.pipelineAssignedUsers, "user");
      default:
        return null;
    }
  };

  if (showForm) {
    return <Form closeModal={() => setShowForm(!showForm)} type={type} />;
  }

  return (
    <>
      <ListHeader
        headerLabel={config[`${type}Label`] || `${capitalize(type)}s`}
        baseColor={getConfigColor(config, "baseColor")}
        mode={mode}
        type={type}
        viewType={viewType}
        setMode={setMode}
        setViewType={setViewType}
        setShowForm={setShowForm}
      />

      {renderContent()}
    </>
  );
}

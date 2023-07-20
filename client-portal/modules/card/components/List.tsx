import { Config, IUser } from "../../types";
import React, { useEffect, useState } from "react";
import { capitalize, getConfigColor } from "../../common/utils";
import { duedateFilter, priorityFilter } from "../../main/constants";

import BoardView from "./BoardView";
import Detail from "../containers/Detail";
import EmptyState from "../../common/form/EmptyState";
import Form from "../containers/Form";
import Group from "../containers/Group";
import ListHeader from "./ListHeader";
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

  const activeStages =
    stages.length !== 0 && stages.filter((s) => s.itemsTotalCount !== 0);
  const currentStage =
    (activeStages || []).length !== 0 ? activeStages[0] : null;
  const activeId = stageId ? stageId : currentStage ? currentStage._id : "";

  const [mode, setMode] = useState("stage");
  const [viewType, setViewType] = useState("list");
  const [showForm, setShowForm] = useState(false);
  const [activeStageId, setStageId] = useState(activeId);

  useEffect(() => {
    // tslint:disable-next-line:no-unused-expression
    stageId && setStageId(stageId);
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
      return <EmptyState icon="ban" text="No cards" size="small" />;
    }

    return (items || []).map((item, index) => {
      const id =
        groupType === "priority" || groupType === "duedate"
          ? item.name
          : item._id;

      return (
        <React.Fragment key={index}>
          <Group groupType={groupType} type={type} id={id} item={item} />
        </React.Fragment>
      );
    });
  };

  const renderContent = () => {
    if (viewType === "board") {
      return (
        <BoardView
          stages={stages}
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
        return renderGroup(stages, "stage");
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
        hideHeader={!stages || stages.length === 0}
      />

      {renderContent()}
    </>
  );
}

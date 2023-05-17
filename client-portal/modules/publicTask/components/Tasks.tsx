import { Config, IStage, IUser } from "../../types";
import { TabContainers, TabTitle } from "../../styles/tasks";

import Item from "../containers/Item";
import Link from "next/link";
import React from "react";
import TaskHeader from "./Header";
import { getConfigColor } from "../../common/utils";

type Props = {
  stages: IStage[];
  config: Config;
  stageId: string;
  currentUser: IUser;
};

function Tasks({ stages, config, stageId, currentUser }: Props) {
  if (!stages || stages.length === 0) {
    return null;
  }

  return (
    <>
      <TaskHeader currentUser={currentUser} taskLabel={"Public Task"} />
      <TabContainers>
        {stages.map((stage) => (
          <TabTitle
            key={stage._id}
            active={stageId === stage._id}
            color={getConfigColor(config, "activeTabColor")}
          >
            <Link href={`/publicTasks?stageId=${stage._id}`}>{stage.name}</Link>
          </TabTitle>
        ))}
      </TabContainers>

      <Item stageId={stageId && stageId.toString()} />
    </>
  );
}

export default Tasks;

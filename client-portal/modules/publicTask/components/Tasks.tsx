import { Config, IStage, IUser } from "../../types";
import React, { useState } from "react";
import { TabContainers, TabTitle } from "../../styles/tasks";

import Detail from "../../card/containers/Detail";
import Item from "../containers/Item";
import Link from "next/link";
import TaskHeader from "./Header";
import { getConfigColor } from "../../common/utils";
import { useRouter } from "next/router";

type Props = {
  stages: IStage[];
  config: Config;
  stageId: string;
  currentUser: IUser;
};

function PublicTasks({ stages, config, stageId, currentUser }: Props) {
  const router = useRouter();
  const { itemId } = router.query as any;

  const [taskId, setId] = useState(null);

  if (!stages || stages.length === 0) {
    return null;
  }

  if (itemId) {
    return (
      <Detail
        _id={itemId}
        onClose={() => router.push("/publicTasks")}
        currentUser={currentUser}
        config={config}
        type="task"
      />
    );
  }

  return (
    <>
      <TaskHeader currentUser={currentUser} taskLabel={"Public Task"} />
      <TabContainers>
        {stages.map((stage) => (
          <TabTitle
            key={stage._id}
            active={stageId === stage._id}
            color={getConfigColor(config, "baseColor")}
          >
            <Link href={`/publicTasks?stageId=${stage._id}`}>{stage.name}</Link>
          </TabTitle>
        ))}
      </TabContainers>

      <Item stageId={stageId && stageId.toString()} />
    </>
  );
}

export default PublicTasks;

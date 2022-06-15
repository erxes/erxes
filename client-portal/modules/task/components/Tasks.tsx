import React from "react";
import Item from "../containers/Item";
import { TabContainers, TabTitle } from "../../styles/tasks";
import Link from "next/link";
import { Config, IStage } from "../../types";
import { getConfigColor } from "../../common/utils";

type Props = {
  stages: IStage[];
  config: Config;
  stageId: string;
};

function Tasks({ stages, config, stageId }: Props) {
  if (!stages || stages.length === 0) {
    return null;
  }

  return (
    <>
      <TabContainers>
        {stages.map((stage) => (
          <TabTitle
            key={stage._id}
            active={stageId === stage._id}
            color={getConfigColor(config, "activeTabColor")}
          >
            <Link href={`/tasks?stageId=${stage._id}`}>{stage.name}</Link>
          </TabTitle>
        ))}
      </TabContainers>

      <Item stageId={stageId && stageId.toString()} />
    </>
  );
}

export default Tasks;

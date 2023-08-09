import { Config, IStage, IUser } from "../../types";
import React, { useState } from "react";
import { TabContainers, TabTitle } from "../../styles/tasks";

import Detail from "../../card/containers/Detail";
import Group from "../containers/Group";
import Link from "next/link";
import { getConfigColor } from "../../common/utils";
import { useRouter } from "next/router";

type Props = {
  stages: IStage[];
  config: Config;
  stageId: string;
  type: string;
  groupType: string;
  viewType: string;
  currentUser: IUser;
};

function BoardView({
  stages,
  config,
  stageId,
  viewType,
  type,
  groupType,
  currentUser,
}: Props) {
  const router = useRouter();
  const { itemId } = router.query as any;

  if (!stages || stages.length === 0) {
    return null;
  }

  if (itemId) {
    return (
      <Detail
        _id={itemId}
        onClose={() => router.push(`/${type}`)}
        currentUser={currentUser}
        config={config}
        type={type}
      />
    );
  }

  return (
    <>
      <TabContainers>
        {stages.map((stage) => {
          return (
            <TabTitle
              key={stage._id}
              active={stageId === stage._id}
              color={getConfigColor(config, "baseColor")}
            >
              <Link href={`/${type}s?stageId=${stage._id}`}>{stage.name}</Link>
            </TabTitle>
          );
        })}
      </TabContainers>

      <Group
        groupType={groupType}
        viewType={viewType}
        type={type}
        id={stageId}
      />
    </>
  );
}

export default BoardView;

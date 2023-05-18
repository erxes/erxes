import { Config, IUser } from "../../types";
import { Label, ListBody, ListHead, ListRow } from "../../styles/tickets";

import Detail from "../containers/Detail";
import EmptyContent from "../../common/EmptyContent";
import React from "react";
import TaskHeader from "./TaskHeader";
import dayjs from "dayjs";
import { useRouter } from "next/router";

type Props = {
  loading: boolean;
  tasks: any;
  currentUser: IUser;
  config: Config;
};

export default function Task({ tasks, currentUser, config }: Props) {
  const router = useRouter();
  const { itemId } = router.query as { itemId: string };

  const renderContent = () => {
    if (!tasks || tasks.length === 0) {
      return <EmptyContent text="You don't have more tasks to view!" />;
    }

    return (
      <>
        <ListHead className="head">
          <div>Subject</div>
          <div>Start date</div>
          <div>Close date</div>
          <div>Created date</div>
          <div>Stage changed date</div>
          <div>Stage</div>
          <div>Labels</div>
        </ListHead>
        <ListBody>
          {(tasks || []).map((task) => {
            const { stage = {}, labels } = task;

            return (
              <ListRow
                key={task._id}
                className="item"
                onClick={() => router.push(`/tasks?itemId=${task._id}`)}
              >
                <div className="base-color">{task.name}</div>

                <div>
                  {task.startDate
                    ? dayjs(task.startDate).format("MMM D YYYY")
                    : "-"}
                </div>
                <div>
                  {task.closeDate
                    ? dayjs(task.closeDate).format("MMM D YYYY")
                    : "-"}
                </div>
                <div>{dayjs(task.createdAt).format("MMM D YYYY")}</div>
                <div>
                  {task.stageChangedDate
                    ? dayjs(task.stageChangedDate).format("MMM D YYYY")
                    : "-"}
                </div>

                <div className="base-color">{stage.name}</div>

                <div>
                  {(labels || []).map((label) => (
                    <Label
                      key={label._id}
                      lblStyle={"custom"}
                      colorCode={label.colorCode}
                    >
                      {label.name}
                    </Label>
                  ))}
                </div>
              </ListRow>
            );
          })}
        </ListBody>
      </>
    );
  };

  if (itemId) {
    return (
      <Detail
        _id={itemId}
        onClose={() => router.push("/tasks")}
        currentUser={currentUser}
        config={config}
      />
    );
  }

  return (
    <>
      <TaskHeader taskLabel={config.taskLabel || "Tasks"} />
      {renderContent()}
    </>
  );
}

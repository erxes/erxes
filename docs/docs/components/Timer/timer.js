import React from "react";
import TaskTimer from "erxes-ui/lib/components/Timer";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";

export function TimerComponent(props) {
  const { id, taskstatus, time, startedAt, table = [], type } = props;

  const propDatas = (taskId, status, timeSpent, startDate) => {
    const datas = {
      taskId: id,
      status: taskstatus,
      timeSpent: time,
      startDate: startedAt,
    };

    return datas;
  };

  const renderBlock = (taskId, status, timeSpent, startDate) => {
    return (
      <>
        <TaskTimer {...propDatas(taskId, status, timeSpent, startDate)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<TaskTimer ${stringify(
            propDatas(taskId, status, timeSpent, startDate)
          )} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APItimer") {
    return (
      <>
        <CodeBlock className="language-jsx">
          import TaskTimer from "erxes-ui/lib/components/Timer";
        </CodeBlock>
        {renderApiTable("", table)}
      </>
    );
  }

  return renderBlock("taskId", "status", "timeSpent", "startDate");
}

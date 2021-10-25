import React from "react";
import TaskTimer from "erxes-ui/lib/components/Timer";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function TimerComponent(props) {
  const { id, taskstatus, time, startedAt, table=[] } = props;

  const propDatas = (taskId, status, timeSpent, startDate) => {
    const datas = {
      taskId: id,
      status: taskstatus,
      timeSpent: time,
      startDate: startedAt,
    };
    
    return datas;
  }

  const renderBlock = (taskId, status, timeSpent, startDate) => {
  return (
    <>
    <TaskTimer {...propDatas(taskId, status, timeSpent, startDate)}/>
    <CodeBlock className="language-jsx">
          {`<>\n\t<TaskTimer ${JSON.stringify(propDatas(taskId, status, timeSpent, startDate))} />\n</>`}
        </CodeBlock>
    </>
  );
};

return renderBlock("taskId", "status", "timeSpent", "startDate")
}
import React from "react";
import TaskTimer from "erxes-ui/lib/components/Timer";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";

export function TimerComponent(props) {
  const { taskstatus, startedAt, table = [], type } = props;

  const propDatas = () => {
    const datas = {
      taskId: "timerTask",
      status: taskstatus,
      timeSpent: "1000",
      startDate: startedAt,
    };

    return datas;
  };

  const renderBlock = () => {
    return (
      <>
        <TaskTimer {...propDatas()} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<TaskTimer ${stringify(
            propDatas()
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

  return renderBlock();
}

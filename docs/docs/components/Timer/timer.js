import React from "react";
import TaskTimer from "erxes-ui/lib/components/Timer";
import CodeBlock from "@theme/CodeBlock";
import { stringify } from "../common.js";
import Table from "erxes-ui/lib/components/table/index";
import styles from "../../../src/components/styles.module.css";

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
        <p className={styles.required}>* required prop</p>
      <Table>
        <thead>
          <tr>
            <th colSpan="2">Name</th>
            <th>Type</th>
            <th>Defualt</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan="2">* taskId</td>
            <td>string</td>
            <td/>
            <td>Define task id</td>
          </tr>
          <tr>
            <td colSpan="2">* status</td>
            <td>started || paused || stopped || completed</td>
            <td/>
            <td>Define task status</td>
          </tr>
          <tr>
            <td colSpan="2">* timeSpent</td>
            <td>number</td>
            <td></td>
            <td>Define time spent in task</td>
          </tr>
          <tr>
            <td colSpan="2">startDate</td>
            <td>string</td>
            <td/>
            <td>Define start date of task</td>
          </tr>
          <tr>
            <td rowSpan="5">* update</td>
            <td >* _id</td>
            <td>string</td>
            <td/>
            <td>Define updated id</td>
          </tr>
          <tr>
            <td>* status</td>
            <td>started || paused || stopped || completed</td>
            <td/>
            <td>Define update status</td>
          </tr>
          <tr>
            <td>* timeSpent</td>
            <td>number</td>
            <td/>
            <td>Define updated time spent</td>
          </tr>
          <tr>
            <td>startDate</td>
            <td>string</td>
            <td/>
            <td>Define update start date</td>
          </tr>
          <tr>
            <td>callback</td>
            <td>function</td>
            <td/>
            <td></td>
          </tr>
        </tbody>
      </Table>
      </>
    );
  }

  return renderBlock();
}

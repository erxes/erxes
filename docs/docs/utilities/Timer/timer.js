import React from "react";
import TaskTimer from "erxes-ui/lib/components/Timer";
import CodeBlock from "@theme/CodeBlock";
import Table from "erxes-ui/lib/components/table/index";
import styles from "../../../src/components/styles.module.css";

export function TimerComponent(props) {
  const { taskstatus, type } = props;

  const propDatas = () => {
    const datas = {
      taskId: "timerTask",
      status: taskstatus,
      timeSpent: taskstatus === "started" ? 0 : 180,
      startDate: taskstatus === "started" && new Date(new Date().getTime()),
      update: () => {},
    };

    return datas;
  };

  function stringify(datas) {
    let string = JSON.stringify(datas);
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/}/g, "");
    string = string.replace(/startDate=false/g, "");
    string = string.replace(/180/g, "{180}");
    string = string.replace(/timeSpent=0/g, "timeSpent={0}");

    return string;
  }

  const renderBlock = () => {
    return (
      <>
        <TaskTimer {...propDatas()} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<TaskTimer ${stringify(propDatas())} />\n</>`}
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
        <p>
          required prop - <span className={styles.required}>*</span>
        </p>
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
              <td colSpan="2">
                taskId<span className={styles.required}>*</span>
              </td>
              <td>string</td>
              <td />
              <td>Define task id</td>
            </tr>
            <tr>
              <td colSpan="2">
                status<span className={styles.required}>*</span>
              </td>
              <td>started | paused | stopped | completed</td>
              <td />
              <td>Define task status</td>
            </tr>
            <tr>
              <td colSpan="2">
                timeSpent<span className={styles.required}>*</span>
              </td>
              <td>number</td>
              <td></td>
              <td>Define time spent in task</td>
            </tr>
            <tr>
              <td colSpan="2">startDate</td>
              <td>string</td>
              <td />
              <td>Define start date of task</td>
            </tr>
            <tr>
              <td rowSpan="5">
                update<span className={styles.required}>*</span>
              </td>
              <td>
                _id<span className={styles.required}>*</span>
              </td>
              <td>string</td>
              <td />
              <td>Define updated id</td>
            </tr>
            <tr>
              <td>
                status<span className={styles.required}>*</span>
              </td>
              <td>started | paused | stopped | completed</td>
              <td />
              <td>Define update status</td>
            </tr>
            <tr>
              <td>
                timeSpent<span className={styles.required}>*</span>
              </td>
              <td>number</td>
              <td />
              <td>Define updated time spent</td>
            </tr>
            <tr>
              <td>startDate</td>
              <td>string</td>
              <td />
              <td>Define update start date</td>
            </tr>
            <tr>
              <td>callback</td>
              <td>function</td>
              <td />
              <td>Change task status </td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

  return renderBlock();
}

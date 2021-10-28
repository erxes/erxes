import React from "react";
import ProgressBar from "erxes-ui/lib/components/ProgressBar";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";

export function ProgressBarComponent(props) {
  const { percent, colorOf, child, closetext, heights, type, table = [] } = props;

  const propDatas = (percentage, color, children, close, height) => {
    const datas = {
      percentage: percent,
      color: colorOf,
      children: percent + "%",
      close: closetext,
      height: heights,
    };

    return datas;
  };

  const renderBlock = (percentage, color, children, close, height) => {
    return (
      <>
        <div className={styles.styled}>
          <ProgressBar
            {...propDatas(percentage, color, children, close, height)}
          />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<ProgressBar ${stringify(
            propDatas(percentage, color, children, close, height)
          )} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIprogressbar"){
    return renderApiTable("ProgressBar", table);
  }
  
  return renderBlock("percentage", "color", "children", "close", "height");
}

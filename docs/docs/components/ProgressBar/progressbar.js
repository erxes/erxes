import React from "react";
import ProgressBar from "erxes-ui/lib/components/ProgressBar";
import styles from "../../../src/components/styles.module.css";
import Button from "erxes-ui/lib/components/Button";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";

export function ProgressBarComponent(props) {
  const { percentage = 35, color, close, height, type, table = [] } = props;

  const propDatas = () => {
    const datas = {
      percentage,
      color: color,
      close: close && <Button>Close button</Button>,
      height: height,
    };

    return datas;
  };

  const renderBlock = () => {
    return (
      <>
        <div className={styles.styled}>
          <ProgressBar {...propDatas()}>35%</ProgressBar>
        </div>
        <br />
        <CodeBlock className="language-jsx">
          {`<>\n\t<ProgressBar ${stringify(propDatas())} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIprogressbar") {
    return renderApiTable("ProgressBar", table);
  }

  return renderBlock();
}

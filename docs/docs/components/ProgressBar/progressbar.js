import React from "react";
import ProgressBar from "erxes-ui/lib/components/ProgressBar";
import styles from "../../../src/components/styles.module.css";
import Button from "erxes-ui/lib/components/Button";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";

export function ProgressBarComponent(props) {
  const { percentage = 35, color, close, height, type, table = [] } = props;

  const propDatas = (extra, isComponent) => {
    const datas = {
      percentage,
      color: color,
      close:
        close && isComponent && extra ? <Button>Close button</Button> : extra,
      height: height,
    };

    return datas;
  };

  const renderBlock = (extra) => {
    return (
      <>
        <div className={styles.styled}>
          <ProgressBar {...propDatas(extra, true)}>35%</ProgressBar>
          {close && <><br /><br /></>}
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<ProgressBar ${stringify(propDatas(extra))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (close) {
    return renderBlock("<Button>Close button</Button>");
  }

  if (type === "APIprogressbar") {
    return renderApiTable("ProgressBar", table);
  }

  return renderBlock();
}

import React from "react";
import Spinner from "erxes-ui/lib/components/Spinner";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable, stringify } from "../common.js";

export function SpinnerComponent(props) {
  const { type, values = [], rights = [], table = [] } = props;

  const propDatas = (propName, value, index) => {
    const datas = {
      [propName]: value,
      right: rights && rights[index],
      objective: true,
    };
    
    return datas;
  };

  const renderBlock = (propName) => {
    return (
      <>
        <div className={styles.styleSpinner}>
          {values.map((value, index) => (
            <div className={styles.spinner}>
              <Spinner key={index} {...propDatas(propName, value, index)} />
            </div>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${values.map(
            (value, index) =>
            `\n\t<Spinner ${stringify(propDatas(propName, value, index))}/>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "size") {
    return renderBlock("size");
  }

  if (type === "position") {
    return renderBlock("left");
  }

  if (type === "objective") {
    return renderBlock("left");
  }

  if (type === "APIspinner") {
    return renderApiTable("Spinner", table);
  }

  return null;
}

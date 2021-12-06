import React from "react";
import SortHandler from "erxes-ui/lib/components/SortHandler";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../../src/components/styles.module.css";
import { renderApiTable, stringify } from "../common.js";

export function SortHandlerComponent(props) {
  const { type, table = [], label } = props;

  const propDatas = (propName) => {
    const datas = {
      label: label && label,
    };

    return datas;
  };

  const renderBlock = (propName) => {
    return (
      <>
        {propName === "sameField" ? (
          <div className={styles.sortHandlerContainer}>
            <SortHandler sortField="field1" label="Label1" />
            <SortHandler sortField="field1" label="Label2" />
            <SortHandler sortField="field2" label="Label3" />
          </div>
        ) : (
          <div className={styles.sortHandlerContainer}>
            <SortHandler {...propDatas(propName)} />
          </div>
        )}
        <CodeBlock className="language-jsx">
          {`<>${
            propName === "sameField"
              ? `\n\t<SortHandler sortField="field1" label="Label1" />\n\t<SortHandler sortField="field1" label="Label2" />\n\t<SortHandler sortField="field2" label="Label3" />`
              : `\n\t<SortHandler ${stringify(propDatas(propName))} />`
          }\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "default") {
    return renderBlock("");
  }

  if (type === "label") {
    return renderBlock("label");
  }

  if (type === "sameField") {
    return renderBlock("sameField");
  }

  if (type === "APIsorthandler") {
    return renderApiTable("SortHandler", table);
  }

  return null;
}

import React from "react";
import Label from "erxes-ui/lib/components/Label";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function LabelComponent(props) {
  const { type, style = [], table = [] } = props;

  const propDatas = (propName, stl) => {
    const kind = {
      [propName]:
        propName === "lblStyle" || propName === "lblColor" ? stl : "Label",
    };

    const datas = {
      ...kind,
    };

    return datas;
  };

  const renderBlock = (propName) => {
    return (
      <>
        <div className={styles.styled}>
          {style.map((stl, index) => {
            return (
              <Label key={index} {...propDatas(propName, stl)}>
                {stl}
              </Label>
            );
          })}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${
            propName === "children"
              ? `\n\t<Label children="Label"></Label>`
              : ``
          }${style
            .map((stl, index) => {
              return `\n\t<Label ${stringify(
                propDatas(propName, stl)
              )}>${stl}</Label>`;
            })
            .join(" ")}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "lblStyle") {
    return renderBlock("lblStyle");
  }

  if (type === "lblColor") {
    return renderBlock("lblColor");
  }

  if (type === "APIlabel") {
    return renderApiTable("Label", table);
  }

  return null;
}

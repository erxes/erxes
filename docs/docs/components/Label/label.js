import React from "react";
import Label from "erxes-ui/lib/components/Label";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import styles from "../../../src/components/styles.module.css";


export function LabelComponent(props) {
  const { type, style = [], color, table = [] } = props;
  let string;

  const propDatas = (propName, stl) => {
    const kind = {
      [propName]:
        propName === "lblStyle" ||
        propName === "lblColor" ||
        propName === "classname" ||
        propName === "children"
          ? stl.toLowerCase()
          : true,
    };

    const datas = {
      ...kind,
    };

    string = JSON.stringify(datas);
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/}/g, "");

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
          {`<>\t${style.map((stl, index) => {
            return `\n\t<Label ${string}>${stl}</Label>`;
          })}\n</>`}
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
  if (type === "className") {
    return renderBlock("className");
  }
  if (type === "children") {
    return renderBlock("children");
  }

  if (type === "APIlabel") {
    return renderApiTable("Label", table);
  }
  return null;
}

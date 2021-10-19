import React from "react";
import Label from "erxes-ui/lib/components/Label";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";

export function LabelComponent(props) {
  const { type, styles = [], color, table = [] } = props;

  const propDatas = (propName, stl) => {
    const kind = {
      [propName]: propName === "lblStyle" || propName === "lblColor" || propName === "classname" || propName === "children"
      ? stl.toLowerCase() : true,
    };
    const datas = {
      ...kind,
    };
    return datas;
  };
  const renderBlock = (propName) => {
    console.log();
    return (
      <>
        <div>
          {styles.map((stl, index) => {
            return (
              <Label key={index} {...propDatas(propName, stl)}>
                {stl}
              </Label>
            );
          })}
        </div>
        <CodeBlock className="language-jsx">
          {`<>\t${styles.map((stl, index) => {
            console.log(propDatas(propName, stl));
            return `\n\t<Label ${JSON.stringify(
              propDatas(propName, stl)
            )}>${stl}</Label>`;
          })}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "lblStyle") {
    return renderBlock("lblStyle");
  }
  if (type === "lblColor") {
    return renderBlock("lblColor")
  }
  if (type === "className") {
    return renderBlock("className")
  }
  if (type === "children") {
    return renderBlock("children")
  }

  if (type === "APIlabel") {
    return renderApiTable("Label", table);
  }
  return null;
}

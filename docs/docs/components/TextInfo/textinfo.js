import React from "react";
import TextInfo from "erxes-ui/lib/components/TextInfo";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable, stringify } from "../common.js";

export function TextInfoComponent(props) {
  const { style = [], type, table = [] } = props;

  const propDatas = (propname, stl) => {
    const kind = {
      [propname]:
        propname === "textStyle" || propname === "hugeness" ? stl : true,
    };

    return kind;
  };

  const renderBlock = (propname, stl) => {
    return (
      <>
        {style.map((stl, index) => {
          return (
            <>
              <TextInfo key={index} {...propDatas(propname, stl)}>
                {stl}
              </TextInfo>{" "}
            </>
          );
        })}
        <CodeBlock className="language-jsx">
          {`<>${style.map((stl, index) => {
            return `\n\t
            <TextInfo ${stringify(
              propDatas(propname, stl, index)
            )} >${stl}</TextInfo>`;
          })}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APItextinfo") {
    return renderApiTable("TextInfo", table);
  }
  if (type === "textStyle") {
    return renderBlock("textStyle");
  }
  if (type === "hugeness") {
    return renderBlock("hugeness");
  }
  return null;
}

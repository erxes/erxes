import React from "react";
import TextInfo from "erxes-ui/lib/components/TextInfo";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable, stringify } from "../common.js";
import Button from "erxes-ui/lib/components/Button";

export function TextInfoComponent(props) {
  const { style = [], type, table = [] } = props;

  const propDatas = (textStyle, stl) => {
    const kind = {
      [textStyle]: stl,
    };

    return kind;
  };

  const renderBlock = (textStyle) => {
    return (
      <>
        {style.map((stl, index) => {
          return (
            <>
              <TextInfo {...propDatas(textStyle, stl)} hugeness="big">
                {stl}
              </TextInfo>{" "}
              <TextInfo {...propDatas(textStyle, stl)}>{stl}</TextInfo>
            </>
          );
        })}
        <CodeBlock className="language-jsx">
          {`<>${style.map((stl, index) => {
            return `\n\t
            <TextInfo ${stringify(
              propDatas(textStyle, stl, index)
            )} hugeness="big" >${stl}</TextInfo>\n\t
            <TextInfo ${stringify(
              propDatas(textStyle, stl, index)
            )} hugeness="small" >${stl}</TextInfo>`;
          })}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APItextinfo") {
    return renderApiTable("TextInfo", table);
  }

  return renderBlock("textStyle");
}

import React from "react";
import Info from "erxes-ui/lib/components/Info";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable, stringify } from "../common.js";

export function InfoComponent(props) {
  const { func, table = [] } = props;
  let string;
  const types = ["Primary", "Info", "Danger", "Warning", "Success"];
  const title = ["Primary", "Info", "Danger", "Warning", "Success"];
  const icons = [
    "envelope-alt",
    "info-circle",
    "times-circle",
    "exclamation-triangle",
    "check-circle",
  ];

  const propDatas = (type, info, iconShow, title, index) => {
    const datas = {
      iconShow: iconShow && icons[index],
      type: info.toLowerCase(),
      title: title[index],
    };

    return datas;
  };

  const renderBlock = (type, iconShow) => {
    console.log();
    return (
      <>
        <div>
          {types.map((info, index) => {
            return (
              <Info
                key={index}
                {...propDatas(type, info, iconShow, title, index)}
              >
                {info}
              </Info>
            );
          })}
        </div>

        <CodeBlock className="language-jsx">
          {`<>\t${types.map((info, index) => {
            return `\n\t<Info ${stringify(
              propDatas(type, info, iconShow, title, index)
            )} >${info}</Info>`;
          })}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (func === "infos") {
    return renderBlock("type");
  }

  if (func === "icon") {
    return renderBlock("type", "iconShow");
  }

  if (func === "APIinfo") {
    return renderApiTable("Info", table);
  }
  return null;
}

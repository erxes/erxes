import React from "react";
import Info from "erxes-ui/lib/components/Info";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable, stringify } from "../common.js";

export function InfoComponent(props) {
  const { func, table = [] } = props;
  const types = ["Primary", "Info", "Danger", "Warning", "Success"];
  const title = ["Primary", "Info", "Danger", "Warning", "Success"];

  const propDatas = (type, iconShow, index) => {
    const datas = {
      iconShow: iconShow && true,
      type: type.toLowerCase(),
      title: title[index],
    };

    return datas;
  };

  const renderBlock = (type, iconShow) => {
    return (
      <>
        <div>
          {types.map((type, index) => {
            return (
              <Info key={index} {...propDatas(type, iconShow, index)}>
                {type}
              </Info>
            );
          })}
        </div>

        <CodeBlock className="language-jsx">
          {`<>\t${types
            .map((type, index) => {
              return `\n\t<Info ${stringify(
                propDatas(type, iconShow, index)
              )} >${type}</Info>`;
            })
            .join(" ")}\n</>`}
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

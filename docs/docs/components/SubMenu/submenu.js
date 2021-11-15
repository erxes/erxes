import React from "react";
import Submenu from "erxes-ui/lib/components/subMenu/Submenu";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";

export function SubMenuComponent(props) {
  const { add, table = [], type } = props;
  const array = [
    { title: "Submenu 1", link: "" },
    { title: "Submenu 2", link: "" },
    { title: "Submenu 3", link: "" },
  ];
  const addition = "Additional item";

  const propDatas = () => {
    const kind = {
      items: array,
      additionalMenuItem: add && addition,
    };
    return kind;
  };

  const stringify = (kind) => {
    let string = JSON.stringify(kind);
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/}/g, "");
    string = string.replace(/=true/g, "");
    return string;
  };

  const renderBlock = () => {
    return (
      <>
        <Submenu {...propDatas()} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<Submenu ${stringify(propDatas())} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type) {
    return renderApiTable("Submenu", table);
  }
  return renderBlock();
}

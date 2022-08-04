import React from "react";
import ModifiableList from "erxes-ui/lib/components/ModifiableList";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function ModifiableListComponent(props) {
  const { array = [], buttonlabel, type, table = [] } = props;

  const propDatas = (options, addButtonLabel) => {
    const kind = {
      [options]: array,
      addButtonLabel: buttonlabel,
    };

    return kind;
  };

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/":/g, "=");
    string = string.replace(/],"/g, "] ");
    string = string.replace(/s=/g, "s={");
    string = string.replace(/]/g, "]}");
    string = string.slice(2, string.length - 1);
    return string;
  }

  const renderBlock = (options, addButtonLabel) => {
    return (
      <>
        <ModifiableList {...propDatas(options, addButtonLabel)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<ModifiableList ${stringify(
            propDatas(options, addButtonLabel)
          )} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APImodifiablelist") {
    return renderApiTable("ModifiableList", table);
  }

  return renderBlock("options", "addButtonLabel");
}

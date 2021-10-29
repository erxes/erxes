import React from "react";
import ModifiableList from "erxes-ui/lib/components/ModifiableList";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
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

  const renderBlock = (options, addButtonLabel) => {
    return (
      <>
        <ModifiableList {...propDatas(options, addButtonLabel)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<ModifiableList ${JSON.stringify(
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

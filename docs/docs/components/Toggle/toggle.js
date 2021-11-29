import React from "react";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import "erxes-icon/css/erxes.min.css";
import Toggle from "erxes-ui/lib/components/Toggle";
import styles from "../../../src/components/styles.module.css";

export function ToggleComponent(props) {
  const { type, table = [] } = props;

  let icon = {
    checked: "Y",
    unchecked: "N"
  };

  const propDatas = (propName, extra) => {
    const kind = {
      [propName]: propName === "icons" ? icon : true,
      [extra]: extra && true,
    };

    return kind;
  };

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/}/g, "");
    string = string.replace(/{}/g, "");
    string = string.replace(/{"/g, "{{");
    string = string.replace(/":/g, ":");
    string = string.replace(/,"/g, " ");
    string = string.replace(/:true/g, "");
    string = string.slice(2, string.length);
    string = string.replace(/icons:/g, "icons=");
    string = string.replace(/Y"/g, 'Y",');
    string = string.replace(/N"/g, 'N"}}');

    return string;
  };

  const renderBlock = (propName, extra) => {
    return (
      <>
        <div className={styles.styled}>
          <Toggle {...propDatas(propName, extra)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Toggle ${stringify(propDatas(propName, extra))}/>\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "simple") {
    return renderBlock();
  }

  if (type === "checked") {
    return renderBlock("checked");
  }

  if (type === "icons") {
    return renderBlock("icons");
  }

  if (type === "defaultChecked") {
    return renderBlock("defaultChecked");
  }

  if (type === "disabled checked") {
    return renderBlock("disabled", "checked");
  }

  if (type === "disabled") {
    return renderBlock("disabled");
  }

  if (type === "ApiToggle") {
    return renderApiTable("Toggle", table);
  }
  return null;
}

import React from "react";
import Icon from "erxes-ui/lib/components/Icon";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function IconComponent(props) {
  const { iconName, colors, sizes, active, type, table = [] } = props;

  const propDatas = (icon, propName, extra) => {
    const datas = {
      icon: iconName,
      [propName]: propName === "color" ? colors : sizes,
      [extra]: extra && true,
    };

    return datas;
  };

  const renderBlock = (icon, propName, extra) => {
    return (
      <>
        <Icon {...propDatas(icon, propName, extra)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<Icon ${stringify(propDatas(icon, propName, extra))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "icon") {
    return renderBlock("icon");
  }

  if (type === "color") {
    return renderBlock("icon", "color");
  }

  if (type === "size") {
    return renderBlock("icon", "size");
  }

  if (type === "active") {
    return renderBlock("icon", "color", "isActive");
  }

  if (type === "APIicon") {
    return renderApiTable("Icon", table);
  }

  return null;
}

import React, { Children } from "react";
import CollapseContent from "erxes-ui/lib/components/CollapseContent";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";
import Icon from "erxes-ui/lib/components/Icon";

export function CollapseContentComponent(props) {
  const { comp, opens, color, img, type, text, table = [] } = props;

  const children = "This is children.";
  const title = "This is title.";

  const propDatas = (propName, beforeTitle) => {
    const kind = {
      compact: comp && comp,
      open: opens && opens,
      image: img && img,
      imageBackground: color && color,
      beforeTitle: beforeTitle && <Icon icon="info-circle" />,
      [propName]: text,
    };

    return kind;
  };

  const renderBlock = (propName, beforeTitle) => {
    return (
      <>
        <CollapseContent title={title} {...propDatas(propName, beforeTitle)}>
          {children}
        </CollapseContent>
        {/* <CodeBlock className="language-jsx">
          {`<>\n\t<CollapseContent title="${title}" ${stringify(
            propDatas(propName, beforeTitle)
          )}>
          ${children}
        </CollapseContent>\n</>`}
        </CodeBlock> */}
      </>
    );
  };

  if (type === "icon") {
    return renderBlock("", "beforeTitle");
  }

  if (type === "desc") {
    return renderBlock("description");
  }

  if (type === "contentid") {
    return renderBlock("contendId");
  }

  if (type === "APIcollapsecontent") {
    return renderApiTable("CollapseContent", table);
  }

  return renderBlock();
}

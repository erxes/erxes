import React, { Children } from "react";
import CollapseContent from "erxes-ui/lib/components/CollapseContent";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";
import Icon from "erxes-ui/lib/components/Icon";
import { updateExportDeclaration } from "typescript";

export function CollapseContentComponent(props) {
  const { comp, opens, color, img, type, text, table = [] } = props;

  const propDatas = (propName, extra, isComponent) => {
    const datas = {
      compact: comp && comp,
      title: "This is title",
      open: opens && opens,
      image: img && img,
      imageBackground: color && color,
      [propName]:
        propName === "beforeTitle" ? (
          isComponent && extra ? (
            <div dangerouslySetInnerHTML={{ __html: extra }} />
          ) : (
            extra
          )
        ) : (
          text
        ),
    };

    return datas;
  };

  const renderBlock = (propName, extra) => {
    return (
      <>
        <CollapseContent
          {...propDatas(propName, extra, true)}
        >
          <div>This is children.</div>
        </CollapseContent>
        <CodeBlock className="language-jsx">
          {`<>\n\t<CollapseContent ${stringify(
            propDatas(propName, extra)
          )} >
          <div>This is children.</div>
        </CollapseContent>\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "icon") {
    return renderBlock("beforeTitle", `<img src='https://erxes.io/static/images/logo/glyph_dark.png' height='40px' />`);
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

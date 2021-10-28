import React from "react";
import EmptyState from "erxes-ui/lib/components/EmptyState";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable, stringify } from "../common.js";

export function EmptyComponents(props) {
  const { type, table = [], item } = props;

  const propDatas = (view, style, additional) => {
    const styling = style === "size" ? "30" : true;

    const kind = {
      [view]: view === "icon" || view === "image" ? item : true,
      [style]: style && styling,
    };

    const datas = {
      ...kind,
      text: "Text",
      extra: additional && "Extra text",
    };

    return datas;
  };

  const renderBlock = (view, style, additional) => {
    return (
      <>
        <EmptyState {...propDatas(view, style, additional)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState ${stringify(propDatas(view, style, additional))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "simple") {
    return renderBlock("icon");
  }

  if (type === "size") {
    return renderBlock("icon", "size");
  }

  if (type === "image") {
    return renderBlock("image");
  }

  if (type === "light") {
    return renderBlock("icon", "light");
  }

  if (type === "extra") {
    return renderBlock("icon", "size", "extra");
  }

  if (type === "APIempty") {
    return renderApiTable("EmptyState", table);
  }

  return null;
}
import React from "react";
import EmptyState from "erxes-ui/lib/components/EmptyState";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Button from "erxes-ui/lib/components/Button";
import { renderApiTable, stringify } from "../common.js";

export function EmptyComponents(props) {
  const { type, table = [], item } = props;

  const propDatas = (view, style, additional) => {
    const extra = additional && <Button>Extra</Button>;

    const kind = {
      [view]: view === "icon" || view === "image" ? item : true,
      [style]: style === "size" ? "30" : true,
      extra,
    };

    const datas = {
      ...kind,
    };

    return datas;
  };

  const renderBlock = (view, style, additional) => {
    return (
      <>
        <EmptyState text="Text" {...propDatas(view, style, additional)} />
        {/* <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState ${stringify(propDatas(propName, btn, icon, index))} />\n</>`}
        </CodeBlock> */}
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
    return renderBlock("icon", "light", "extra");
  }

  if (type === "APIempty") {
    return renderApiTable("EmptyState", table);
  }

  return null;
}

import React from "react";
import EmptyState from "erxes-ui/lib/components/EmptyState";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Button from "erxes-ui/lib/components/Button";
import { renderApiTable } from "../common.js";

export function EmptyComponents(props) {
  const { type, table = [], item } = props;

  const propDatas = (propName, style, additional) => {
    const extra = additional && <Button>Extra</Button> ;

    const kind = {
      [propName]: propName === "icon" || propName === "image" ? item : true,
      [style]: style === "size" ? "30" : true,
      extra
    };

    const datas = {
      ...kind,
    };

    return datas;
  };

  const renderBlock = (propName, style, additional) => {
    let blah2 = JSON.stringify(
      propDatas(propName, style)
    );
    blah2 = blah2.replace(/{"/g, '');
    blah2 = blah2.replace(/":/g, '=');
    blah2 = blah2.replace(/,"/g, ' ');
    blah2 = blah2.replace(/}/g, '');
    // blah2 = blah2.replace(/[}]/g, '');
    // blah2 = blah2.replace(/["]/g, ' ');
    // blah2 = blah2.replace(/[":]/g, '=');
    
    return (
      <>
        <EmptyState text="Text" {...propDatas(propName, style, additional)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState ${blah2} />\n</>`}
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
    return renderBlock("icon", "light", "extra");
  }

  if (type === "APIempty") {
    return renderApiTable("EmptyState", table);
  }

  return null;
}

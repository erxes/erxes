import React from "react";
import FilterableList from "erxes-ui/lib/components/filterableList/FilterableList";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function FilterableListComponent(props) {
  const { type, bo, table = [] } = props;
  const names = ["First test", "Second test", "Third test"];
  const link = [{ title: "Google", href: "https://www.google.com" }];
  const arr = [];
  const avatar = [];
  const addicon = [];

if(type==="style") { names.map((name, index) => {
    arr.push({
      _id: index,
      title: name,
      style: {color: "red"},
    });
  });
}
 else names.map((name, index) => {
    arr.push({
      _id: index,
      title: name,
    });
  });
  

  names.map((name, index) => {
    avatar.push({
      _id: index,
      title: name,
      avatar: "https://erxes.io/static/images/logo/logo_dark.svg",
    });
  });

  names.map((name, index) => {
    addicon.push({
      _id: index,
      title: name,
      avatar: "https://erxes.io/static/images/logo/logo_dark.svg",
      additionalIconClass: "info-circle",
    });
  });

  const array = [
    { _id: "0", title: "1 test" },
    { _id: "1", title: "2 test" },
    { _id: "2", parentId:"1", title: "3 test" },
    { _id: "3", parentId:"1", title: "4 test" },
    { _id: "4", parentId:"2", title: "5 test" },
  ];

  const propDatas = (propName) => {
    const kind = {
      items:
        type === "tree"
          ? array
          : type === "avatar"
          ? avatar
          : type === "null"
          ? ""
          : type === "additionalIconClass"
          ? addicon
          : arr,
      [propName]: propName && propName === "links" ? link : bo,
    };

    return kind;
  };

  const renderBlock = (propName) => {
    return (
      <>
        <FilterableList {...propDatas(propName)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<FilterableList ${stringify(propDatas(propName))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "link") {
    return renderBlock("links");
  }

  if (type === "load") {
    return renderBlock("loading");
  }

  if (type === "check") {
    return renderBlock("showCheckmark");
  }

  if (type === "tree") {
    return renderBlock("treeView");
  }

  if (type === "style") {
    return renderBlock("style");
  }

  if(type==="additionalIconClass"){
    return renderBlock("additionalIconClass")
  }

  if (type === "APIfilterablelist") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import FilterableList from "erxes-ui/lib/components/filterableList/FilterableList";`}</CodeBlock>
        {renderApiTable("", table)}
      </>
    );
  }
  return renderBlock();
}

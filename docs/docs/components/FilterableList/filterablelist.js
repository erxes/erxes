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

  names.map((name, index) => {
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

  const array = [
    { _id: 1, title: "1 test", parentId: 0 },
    { _id: 2, title: "2 test", parentId: 0 },
    { _id: 3, title: "3 test", parentId: 1 },
    { _id: 4, title: "4 test", parentId: 1 },
    { _id: 5, title: "5 test", parentId: 2 },
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

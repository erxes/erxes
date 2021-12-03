import React from "react";
import FilterableList from "erxes-ui/lib/components/filterableList/FilterableList";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable} from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function FilterableListComponent(props) {
  const { type, boolean, table = [] } = props;
  const names = ["First test", "Second test", "Third test"];
  const link = [{ title: "Google", href: "https://www.google.com" }];
  const arr = [];
  const avatar = [];
  const addicon = [];

  if (type === "style") {
      arr.push({
        _id: 0,
        title: names[0],
        style: { color: "purple" },
      });
      arr.push({
        _id: 1,
        title: names[1],
        style: { color: "red" },
      });
      arr.push({
        _id: 2,
        title: names[2],
        style: { color: "green" },
      });
  } else
    names.map((name, index) => {
      arr.push({
        _id: index.toString(),
        title: name,
      });
    });

  names.map((name, index) => {
    avatar.push({
      _id: index.toString(),
      title: name,
      avatar: "https://erxes.io/static/images/logo/logo_dark.svg",
    });
  });

  names.map((name, index) => {
    addicon.push({
      _id: index.toString(),
      title: name,
      avatar: "https://erxes.io/static/images/logo/logo_dark.svg",
      additionalIconClass: "info-circle",
    });
  });

  const array = [
    { _id: "0", title: "Parent 1", iconClass: "iconClass" },
    { _id: "1", title: "Parent 2", iconClass: "iconClass" },
    { _id: "2", parentId: "0", title: "Child of parent 1" },
    { _id: "3", parentId: "1", title: "Child of parent 2" },
    { _id: "4", parentId: "1", title: "Child of parent 2" },
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
      [propName]: propName && propName === "links" ? link : boolean,
      isIndented: propName === "treeView" ? true : false,
    };

    return kind;
  };

  const stringify = (kind) => {
    let string = JSON.stringify(kind);
    string = string.replace(/{"/g, "{");
    string = string.replace(/":/g, ":");
    string = string.replace(/items:/g, "items={");
    string = string.replace(/,"/g, ", ");
    string = string.replace(/, isIndented:false/g, "");
    string = string.replace(/, isIndented:true}/g, "} isIndented={true}");
    string = string.slice(1, string.length);
    string = string.replace(/, loading:true}/g, "} loading={true}");
    string = string.replace(/, treeView:true}/g, "} treeView={true}");
    string = string.replace(/com"}],/g, 'com"}]}');
    string = string.replace(/},/g, "},");
    string = string.replace(/, links:/g, "} links={");
    string = string.replace(/, showCheckmark:false}/g, "} showCheckmark={false}");
    string = string.replace(/{_/g, "\n\t\t{_");
    string = string.replace(/]}/g, "]}\n\t");
    
    return string;
  }

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

  if (type === "additionalIconClass") {
    return renderBlock("additionalIconClass");
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

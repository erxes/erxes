import React from "react";
import FilterableList from "erxes-ui/lib/components/filterableList/FilterableList";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Table from "erxes-ui/lib/components/table/index";
import styles from "../../../src/components/styles.module.css";

export function FilterableListComponent(props) {
  const { type, boolean } = props;
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
      <p><required>* required prop</required></p>
      <Table>
          <thead>
            <tr>
              <th colSpan="2">Name</th>
              <th>Type</th>
              <th>Defualt</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="7">items<required>*</required> (array)</td>
              <td>_id</td>
              <td>string</td>
              <td />
              <td>Define id of item array</td>
            </tr>
            <tr>
              <td>title</td>
              <td>string</td>
              <td />
              <td>Define list item name</td>
            </tr>
            <tr>
              <td>avatar</td>
              <td>string</td>
              <td />
              <td>Show image before item title</td>
            </tr>
            <tr>
              <td>additionalIconClass</td>
              <td>string</td>
              <td />
              <td>Show additional icon on the right side of item title</td>
            </tr>
            <tr>
              <td>style</td>
              <td>object</td>
              <td />
              <td>Add style to item title</td>
            </tr>
            <tr>
              <td>parentId</td>
              <td>string</td>
              <td />
              <td>Define parent by id</td>
            </tr>
            <tr>
              <td>iconClass</td>
              <td>string</td>
              <td />
              <td>Show icon before item title to hide or show children item</td>
            </tr>
            <tr>
              <td colSpan="2">links</td>
              <td>any[]</td>
              <td />
              <td>Define links below list</td>
            </tr>
            <tr>
              <td colSpan="2">showCheckmark</td>
              <td>boolean</td>
              <td>true</td>
              <td>Show checkmart when item list is clicked</td>
            </tr>
            <tr>
              <td colSpan="2">selectable</td>
              <td>boolean</td>
              <td>30px</td>
              <td>Takes spacing on the right</td>
            </tr>
            <tr>
              <td colSpan="2">loading</td>
              <td>boolean</td>
              <td />
              <td>Activates loading spinner</td>
            </tr>
            <tr>
              <td colSpan="2">className</td>
              <td>string</td>
              <td />
              <td>Define className</td>
            </tr><tr>
              <td colSpan="2">treeView</td>
              <td>boolean</td>
              <td />
              <td>Activates tree view of list</td>
            </tr><tr>
              <td colSpan="2">isIndented</td>
              <td>boolean</td>
              <td />
              <td>Take space between arrow and title</td>
            </tr><tr>
              <td colSpan="2">onClick</td>
              <td>function</td>
              <td />
              <td>Define click handler function when list item is clicked</td>
            </tr><tr>
              <td colSpan="2">onSearch</td>
              <td>function</td>
              <td />
              <td>Define search function</td>
            </tr>
          </tbody>
        </Table>
    </>
    );
  }
  return renderBlock();
}

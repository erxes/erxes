import React from "react";
import FilterByParams from "erxes-ui/lib/components/FilterByParams";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../../src/components/styles.module.css";
import Table from "erxes-ui/lib/components/table/index";
import { renderApiTable } from "../common.js";

export function FilterByParamsComponent(props) {
  const { type, color, related, table = [] } = props;
  const names = ["First test", "Second test", "Third test"];
  const colors = ["red", "blue", "green"];
  const arr = [];

  if (color) {
    names.map((name, index) => {
      arr.push({
        _id: index.toString(),
        name: name,
        colorCode: colors[index],
      });
    });
  } else {
    names.map((name, index) => {
      arr.push({
        _id: index.toString(),
        name: name,
      });
    });
  }

  const array = [
    // { _id: "0", name: "Parent 1", relatedIds: [1] },
    // { _id: "1", name: "Parent 2", relatedIds: [3, 4]  },
    { _id: "0", name: "Parent 1" },
    { _id: "1", name: "Parent 2" },
    { _id: "2", parentId: "0", name: "Child of parent 1" },
    { _id: "3", parentId: "1", name: "Child of parent 2" },
    { _id: "4", parentId: "1", name: "Child of parent 2" },
  ];

  const relatedArr = [
    { _id: "0", name: "Parent 1", relatedIds: [2] },
    { _id: "1", name: "Parent 2", relatedIds: [3, 4] },
    // { _id: "0", name: "Parent 1" },
    // { _id: "1", name: "Parent 2" },
    { _id: "2", parentId: "0", name: "Child of parent 1" },
    { _id: "3", parentId: "1", name: "Child of parent 2" },
    { _id: "4", parentId: "1", name: "Child of parent 2" },
  ];

  const propDatas = (propName) => {
    const kind = {
      paramKey: "tag",
      // counts: type === "count" && [1, 2, 3],
      icon: type === "icon" ? "tag-alt" : false,
      counts: related ? [1, 2, 3, 4, 5] : [],
      [propName]: propName === "counts" ? [1, 2, 3] : true,
      fields:
        type === "tree"
          ? related
            ? relatedArr
            : array
          : type === "empty"
          ? []
          : arr,
    };

    return kind;
  };

  const stringify = (kind) => {
    let string = JSON.stringify(kind);
    string = string.replace(/{"/g, "{");
    string = string.replace(/":/g, ":");
    string = string.replace(/,"/g, ", ");
    string = string.replace(/, icon:false/g, "");
    string = string.replace(/, undefined:true/g, "");
    string = string.replace(/, isIndented:true}/g, "} isIndented={true}");
    string = string.replace(/, loading:true/g, " loading");
    string = string.replace(/, treeView:true/g, " treeView");
    string = string.replace(/, multiple:true/g, " multiple");
    string = string.replace(/, searchable:true/g, " searchable");
    string = string.replace(/, icon:/g, " icon=");
    string = string.replace(/com"}],/g, 'com"}]}');
    string = string.replace(/},/g, "},");
    string = string.replace(/paramKey:/g, "paramKey=");
    string = string.replace(/, counts:/g, " counts={");
    string = string.replace(/{_/g, "\n\t\t{_");
    string = string.replace(/, fields:/g, " fields={");
    string = string.replace(/]}/g, "]}");
    string = string.replace(/] /g, "]} ");
    string = string.slice(1, string.length);

    return string;
  };

  const renderBlock = (propName) => {
    return (
      <>
        <div className={styles.styled}>
          <FilterByParams {...propDatas(propName)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<FilterByParams ${stringify(propDatas(propName))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "load") {
    return renderBlock("loading");
  }

  if (type === "search") {
    return renderBlock("searchable");
  }

  if (type === "count") {
    return renderBlock("counts");
  }

  if (type === "multiple") {
    return renderBlock("multiple");
  }

  if (type === "tree") {
    return renderBlock("treeView");
  }

  if (type === "color") {
    return renderBlock("color");
  }

  if (type === "APIfilterbyparams") {
    return (
      <>
        {renderApiTable("FilterByParams")}
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
            <tr>
              <td rowSpan="5">fields<required>*</required></td>
              <td>_id</td>
              <td>string</td>
              <td />
              <td>Define id</td>
            </tr>
            <tr>
              <td>name</td>
              <td>string</td>
              <td />
              <td>Define name</td>
            </tr>
            <tr>
              <td>colorCode</td>
              <td>number</td>
              <td />
              <td>Add custom color</td>
            </tr>
            <tr>
              <td>parentId</td>
              <td>string</td>
              <td />
              <td>Define parent id</td>
            </tr>
            <tr>
              <td>relatedIds</td>
              <td>array</td>
              <td />
              <td>Define related items' ids</td>
            </tr>
          <tbody>
            <tr>
              <td colSpan="2">counts<required>*</required></td>
              <td>any</td>
              <td />
              <td>Define count numbers of list items</td>
            </tr>
            <tr>
              <td colSpan="2">paramKey<required>*</required></td>
              <td>string</td>
              <td />
              <td>Key, used when onClick function runs.</td>
            </tr>
            <tr>
              <td colSpan="2">icon</td>
              <td>string</td>
              <td />
              <td>Add icon to list items</td>
            </tr>
            <tr>
              <td colSpan="2">loading<required>*</required></td>
              <td>boolean</td>
              <td />
              <td>Activates loading spinner</td>
            </tr>
            <tr>
              <td colSpan="2">searchable</td>
              <td>boolean</td>
              <td />
              <td>Add search bar and make the list searchable</td>
            </tr>
            <tr>
              <td colSpan="2">multiple</td>
              <td>boolean</td>
              <td>false</td>
              <td>Make it possible to select multiple items</td>
            </tr>
            <tr>
              <td colSpan="2">treeView</td>
              <td>boolean</td>
              <td />
              <td>Activates tree view of list</td>
            </tr>
            <tr>
              <td colSpan="2">update</td>
              <td>boolean</td>
              <td />
              <td>Define function to filter items</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }
  return renderBlock();
}

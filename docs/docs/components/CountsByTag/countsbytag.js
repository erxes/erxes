import React from "react";
import CountsByTag from "erxes-ui/lib/components/CountsByTag";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../../src/components/styles.module.css";
import Table from "erxes-ui/lib/components/table/index";
import { renderApiTable } from "../common.js";

export function CountsByTagComponent(props) {
  const { type, related } = props;
  const names = ["First test", "Second test", "Third test"];
  const colors = ["red", "blue", "green"];
  const arr = [];

  if (type === "color") {
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
    { _id: "0", name: "Parent 1" },
    { _id: "1", name: "Parent 2" },
    { _id: "2", parentId: "0", name: "Child of parent 1" },
    { _id: "3", parentId: "1", name: "Child of parent 2" },
    { _id: "4", parentId: "1", name: "Child of parent 2" },
  ];

  const relatedArr = [
    { _id: "0", name: "Parent 1", relatedIds: [2] },
    { _id: "1", name: "Parent 2", relatedIds: [3, 4] },
    { _id: "2", parentId: "0", name: "Child of parent 1" },
    { _id: "3", parentId: "1", name: "Child of parent 2" },
    { _id: "4", parentId: "1", name: "Child of parent 2" },
  ];

  const propDatas = () => {
    const kind = {
      counts: type === "cnt" ? [1, 2, 3] : related ? [1, 2, 3, 4, 5] : [],
      manageUrl: type === "manage" && "/",
      loading: type === "load" && true,
      tags:
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
    string = string.replace(/, manageUrl:false/g, "");
    string = string.replace(/, loading:false/g, "");
    string = string.replace(/, loading:true/g, " loading");
    string = string.replace(/, manageUrl:/g, " manageUrl=");
    string = string.replace(/},/g, "},");
    string = string.replace(/counts:/g, " counts={");
    string = string.replace(/{_/g, "\n\t\t{_");
    string = string.replace(/, tags:/g, " tags={");
    string = string.replace(/]}/g, "]}");
    string = string.replace(/] /g, "]} ");
    string = string.slice(1, string.length);

    return string;
  };

  const renderBlock = () => {
    return (
      <>
        <div className={styles.styled}>
          <CountsByTag {...propDatas()} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<CountsByTag ${stringify(propDatas())} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIcountsbytag") {
    return (
      <>
        {renderApiTable("CountsByTag")}
        <p>
          <required>* required prop</required>
        </p>
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
              <td rowSpan="5">
                tags<required>*</required> (array)
              </td>
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
              <td>Define related tags' ids</td>
            </tr>
            <tr>
              <td colSpan="2">
                counts<required>*</required>
              </td>
              <td>any</td>
              <td />
              <td>Define count numbers of tags</td>
            </tr>
            <tr>
              <td colSpan="2">
                loading<required>*</required>
              </td>
              <td>boolean</td>
              <td />
              <td>Activates loading spinner</td>
            </tr>
            <tr>
              <td colSpan="2">
                manageUrl<required>*</required>
              </td>
              <td>string</td>
              <td></td>
              <td>Define url for manage icon</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

  return renderBlock();
}

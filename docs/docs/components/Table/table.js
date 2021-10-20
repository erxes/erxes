import React from "react";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import Table from "erxes-ui/lib/components/table/index";

export function TableComponent(props) {
  const { type, table = [], mergedCellText } = props;

  const propDatas = (propName) => {
    const datas = {
      [propName]: propName === "whiteSpace" ? "normal" : true,
    };

    return datas;
  };

  const renderBlock = (propName, merge) => {
    const additional = merge && (
      <tr>
        <td>3</td>
        <td colSpan="2">{mergedCellText}</td>
        <td>@twitter</td>
      </tr>
    );
    return (
      <>
        <div className={styles.styled}>
          <Table {...propDatas(propName)}>
            <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, index) => {
                return (
                  <tr key={index}>
                    {row.map((cell, i) => (
                      <td key={i}>{cell}</td>
                    ))}
                  </tr>
                );
              })}
              {additional}
            </tbody>
          </Table>
        </div>

        <CodeBlock className="language-jsx">
          {`<Table ${stringify(propDatas(propName))}>`}
          {`\n  <thead>`}
          {`\n    <tr>`}
          {`\n      <th>#</th>`}
          {`\n      <th>First Name</th>`}
          {`\n      <th>Last Name</th>`}
          {`\n      <th>Username</th>`}
          {`\n    <tr>`}
          {`\n  </thead>`}
          {`\n  <tbody>`}
          {`${table.map(
            (row) =>
              `\n    <tr>${row.map(
                (cell) => `\n      <td>${cell}</td>`
              )}\n    <tr>`
          )}`}
          {`${
            additional &&
            `\n    <tr>\n      <td>3</td>\n      <td colSpan="2">${mergedCellText}</td>\n      <td>@twitter</td>\n    <tr>`
          }`}
          {`\n  </tbody>`}
          {`\n</Table>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "bordered") {
    return renderBlock("bordered");
  }

  if (type === "merge") {
    return renderBlock("bordered", "merge");
  }

  if (type === "striped") {
    return renderBlock("striped");
  }

  if (type === "hover") {
    return renderBlock("hover");
  }

  if (type === "whiteSpace") {
    return renderBlock("whiteSpace", "merge");
  }

  if (type === "APItable") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Table from "erxes-ui/lib/components/table/index";`}</CodeBlock>
        {renderApiTable("", table)}
      </>
    );
  }

  return null;
}

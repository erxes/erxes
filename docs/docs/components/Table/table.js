import React from "react";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import Table from 'erxes-ui/lib/components/table/index';

const simpleTable = (table) => {
  return (
    <>
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Username</th>
        </tr>
      </thead>
      <tbody>
        {table.map((row) => (
          <tr>
            {row.map((cell) => (
              <td>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </>
  )
}

const tableCode = (table, bool) => {
  return (
    <>
      <CodeBlock className="language-jsx">
        {`\n\t<Table ${bool}>`}
        {`\n\t  <thead>`}
        {`\n\t    <tr>`}
        {`\n\t      <th>#</th>`}
        {`\n\t      <th>First Name</th>`}
        {`\n\t      <th>Last Name</th>`}
        {`\n\t      <th>Username</th>`}
        {`\n\t    <tr>`}
        {`\n\t  </thead>`}
        {`\n\t  <tbody>`}
        {`${table.map(
          (row) =>
            `\n\t    <tr>${row.map(
              (cell) => `\n\t      <td>${cell}</td>`
            )}\n\t    <tr>`
        )}`}
        {`\n\t  </tbody>`}
        {`\n\t</Table>`}
      </CodeBlock>
    </>
  )
}

export function TableComponent(props) {
  const { type, table = [] } = props;

  if (type === "bordered") {
    return (
      <>
        <Table bordered>
          {simpleTable(table)}
        </Table>
        {tableCode(table, type)}
      </>
    );
  }

  if (type === "merge") {
    return (
      <>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr>
                {row.map((cell) => (
                  <td>{cell}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td>3</td>
              <td colSpan="2">Larry the Bird</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </Table>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<Table merge>`}
          {`\n\t  <thead>`}
          {`\n\t    <tr>`}
          {`\n\t      <th>#</th>`}
          {`\n\t      <th>First Name</th>`}
          {`\n\t      <th>Last Name</th>`}
          {`\n\t      <th>Username</th>`}
          {`\n\t    <tr>`}
          {`\n\t  </thead>`}
          {`\n\t  <tbody>`}
          {`${table.map(
            (row) =>
              `\n\t    <tr>${row.map(
                (cell) => `\n\t      <td>${cell}</td>`
              )}\n\t    <tr>`
          )}`}
          {`\n\t    <tr>`}
          {`\n\t      <td>3</td>`}
          {`\n\t      <td colSpan="2">Larry the bird</td>`}
          {`\n\t      <td>@twitter</td>`}
          {`\n\t    <tr>`}
          {`\n\t  </tbody>`}
          {`\n\t</Table>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "striped") {
    return (
      <>
        <Table striped>
          {simpleTable(table)}
        </Table>
        {tableCode(table, type)}
      </>
    );
  }
  
  if (type === "hover") {
    return (
      <>
        <Table hover>
          {simpleTable(table)}
        </Table>
        {tableCode(table, type)}
      </>
    );
  }

  if (type === "whiteSpace") {
    return (
      <>
        <Table whiteSpace="normal">
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Username</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => (
              <tr>
                {row.map((cell) => (
                  <td>{cell}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td>3</td>
              <td colSpan="2">Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
              American former professional basketball player, coach and
              executive in the National Basketball Association (NBA). Nicknamed
              "the Hick from French Lick" and "Larry Legend," Bird is widely
              regarded as one of the greatest basketball players of all time.{" "}</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </Table>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`\n\t<Table whiteSpace="normal">`}
          {`\n\t  <thead>`}
          {`\n\t    <tr>`}
          {`\n\t      <th>#</th>`}
          {`\n\t      <th>First Name</th>`}
          {`\n\t      <th>Last Name</th>`}
          {`\n\t      <th>Username</th>`}
          {`\n\t    <tr>`}
          {`\n\t  </thead>`}
          {`\n\t  <tbody>`}
          {`${table.map(
            (row) =>
              `\n\t    <tr>${row.map(
                (cell) => `\n\t      <td>${cell}</td>`
              )}\n\t    <tr>`
          )}`}
          {`\n\t    <tr>`}
          {`\n\t      <td>3</td>`}
          {`\n\t      <td colSpan="2">Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
              American former professional basketball player, coach and
              executive in the National Basketball Association (NBA). Nicknamed
              "the Hick from French Lick" and "Larry Legend," Bird is widely
              regarded as one of the greatest basketball players of all time.{" "}</td>`}
          {`\n\t      <td>@twitter</td>`}
          {`\n\t    <tr>`}
          {`\n\t  </tbody>`}
          {`\n\t</Table>`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APItable") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Table from 'erxes-ui/lib/components/table/index';`}</CodeBlock>
        {/* {ApiTable(table)} */}
      </>
    );
  }

  return null;
}
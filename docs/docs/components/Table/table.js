import React from "react";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import Table from "erxes-ui/lib/components/table/index";

export function TableComponent(props) {
  const { type, table = [], mergedCellText } = props;
  let string;

  const propDatas = (propName) => {
    const datas = {
      [propName]: propName === "whiteSpace" ? normal : true,
    };

    string = JSON.stringify(datas);
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/}/g, "");
    string = string.replace(/=true/g, "");

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

        {/* <CodeBlock className="language-jsx">
        {`\n\t<Table ${string}>`}
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
      </CodeBlock> */}

        {/* <CodeBlock className="language-jsx">
          {`<>\n\t<Button>${
            defaultBtn ? defaultBtn : "Default"
          }</Button>${buttons.map((btn, index) => {
            console.log(string);
            return `\n\t<Button ${string}>${btn}</Button>`;
          })}\n</>`}
        </CodeBlock> */}
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
    return renderBlock("striped", "merge");
  }

  if (type === "APItable") {
    return renderApiTable("",table);
  }

  return null;
}

// const tableCode = (table, bool) => {
//   return (
//     <>
      // <CodeBlock className="language-jsx">
      //   {`\n\t<Table ${bool}>`}
      //   {`\n\t  <thead>`}
      //   {`\n\t    <tr>`}
      //   {`\n\t      <th>#</th>`}
      //   {`\n\t      <th>First Name</th>`}
      //   {`\n\t      <th>Last Name</th>`}
      //   {`\n\t      <th>Username</th>`}
      //   {`\n\t    <tr>`}
      //   {`\n\t  </thead>`}
      //   {`\n\t  <tbody>`}
      //   {`${table.map(
      //     (row) =>
      //       `\n\t    <tr>${row.map(
      //         (cell) => `\n\t      <td>${cell}</td>`
      //       )}\n\t    <tr>`
      //   )}`}
      //   {`\n\t  </tbody>`}
      //   {`\n\t</Table>`}
      // </CodeBlock>
//     </>
//   );
// };

// export function TableComponent(props) {
//   const { type, table = [] } = props;

//   if (type === "whiteSpace") {
//     return (
//       <>
//         <Table whiteSpace="normal">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>First Name</th>
//               <th>Last Name</th>
//               <th>Username</th>
//             </tr>
//           </thead>
//           <tbody>
//             {table.map((row, i) => (
//               <tr>
//                 {row.map((cell) => (
//                   <td>{cell}</td>
//                 ))}
//               </tr>
//             ))}
//             <tr>
//               <td>3</td>
//               <td colSpan="2">
//                 Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
//                 American former professional basketball player, coach and
//                 executive in the National Basketball Association (NBA).
//                 Nicknamed "the Hick from French Lick" and "Larry Legend," Bird
//                 is widely regarded as one of the greatest basketball players of
//                 all time.{" "}
//               </td>
//               <td>@twitter</td>
//             </tr>
//           </tbody>
//         </Table>
//         <CodeBlock className="language-jsx">
//           {`<>`}
//           {`\n\t<Table whiteSpace="normal">`}
//           {`\n\t  <thead>`}
//           {`\n\t    <tr>`}
//           {`\n\t      <th>#</th>`}
//           {`\n\t      <th>First Name</th>`}
//           {`\n\t      <th>Last Name</th>`}
//           {`\n\t      <th>Username</th>`}
//           {`\n\t    <tr>`}
//           {`\n\t  </thead>`}
//           {`\n\t  <tbody>`}
//           {`${table.map(
//             (row) =>
//               `\n\t    <tr>${row.map(
//                 (cell) => `\n\t      <td>${cell}</td>`
//               )}\n\t    <tr>`
//           )}`}
//           {`\n\t    <tr>`}
//           {`\n\t      <td>3</td>`}
//           {`\n\t      <td colSpan="2">Larry the Bird. Larry Joe Bird (born December 7, 1956) is an
//               American former professional basketball player, coach and
//               executive in the National Basketball Association (NBA). Nicknamed
//               "the Hick from French Lick" and "Larry Legend," Bird is widely
//               regarded as one of the greatest basketball players of all time.{" "}</td>`}
//           {`\n\t      <td>@twitter</td>`}
//           {`\n\t    <tr>`}
//           {`\n\t  </tbody>`}
//           {`\n\t</Table>`}
//           {`\n</>`}
//         </CodeBlock>
//       </>
//     );
//   }

//   if (type === "APItable") {
//     return (
//       <>
//         <CodeBlock className="language-javascript">{`import Table from 'erxes-ui/lib/components/table/index';`}</CodeBlock>
//         {/* {ApiTable(table)} */}
//       </>
//     );
//   }

//   return null;
// }

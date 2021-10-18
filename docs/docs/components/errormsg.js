import React from "react";
import ErrorMsg from "erxes-ui/lib/components/ErrorMsg";
import Table from "erxes-ui/lib/components/table/index";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";

export function ErrorMsgComponent(props){
  const { children, table= [] } = props;
  if (children){
  return(
    <>
    <ErrorMsg children={children}/>
    <CodeBlock className="language-jsx">
      {`<>`}
      {`<ErrorMsg children="${children}"/>`}
    </CodeBlock>
    </>
  )
  }
  if (table){
    return(
      <>
        <CodeBlock className="language-javascript">{`import ErrorMsg from "erxes-ui/lib/components/ErrorMsg";`}</CodeBlock>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
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
        </Table>
      </>
    )
  }
  return null;
}
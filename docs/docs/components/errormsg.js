import React from "react";
import ErrorMsg from "erxes-ui/lib/components/ErrorMsg";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import ApiTable from "./common";

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
        {ApiTable(table)}
      </>
    )
  }
  return null;
}
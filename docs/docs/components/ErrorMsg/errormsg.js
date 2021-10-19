import React from "react";
import ErrorMsg from "erxes-ui/lib/components/ErrorMsg";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable } from "../common.js";

export function ErrorMsgComponent(props) {
  const { children, table = [] } = props;
  if (children) {
    return (
      <>
        <ErrorMsg children={children} />
        <CodeBlock className="language-jsx">
          {`<ErrorMsg children="${children}"/>`}
        </CodeBlock>
      </>
    );
  }
  if (table) {
    return (
      <>
        {/* {Api("ErrorMsg")}
        {ApiTable(table)} */}
      </>
    );
  }
  return null;
}

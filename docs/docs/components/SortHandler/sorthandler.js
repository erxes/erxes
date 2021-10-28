import React from "react";
import SortHandler from "erxes-ui/lib/components/SortHandler";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../../src/components/styles.module.css";
import { renderApiTable } from "../common.js";

export function SortHandlerComponent(props) {
const {type, table=[]} = props;

if (type === "sorthandler"){
  return (
    <>
      <div className={styles.styled}>
        <SortHandler sortField="field1" label="First Name" />
        <SortHandler sortField="field1" label="Last Name" />
        <SortHandler sortField="field2" label="Age" />
      </div>
      <CodeBlock className="language-jsx">
        {`<>\n\t<SortHandler sortField="field1" label="Name" />\n\t<SortHandler sortField="field2" label="Age" />\n</>`}
      </CodeBlock>
    </>
  );
}

if (type === "APIsorthandler"){
  return renderApiTable("SortHandler", table);
}

return null;
}

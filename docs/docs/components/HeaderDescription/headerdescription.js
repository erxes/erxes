import React from "react";
import HeaderDescription from "erxes-ui/lib/components/HeaderDescription";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function HeaderDescriptionComponent(props) {
  const {type, table=[] } = props;

  if (type === "APIheaderdescription"){
    return renderApiTable("HeaderDescription", table)
  }
  
  return (
    <>
      <HeaderDescription
        icon="https://erxes.io/static/images/logo/logo_dark.svg"
        title="Title"
        description="Description"
      />
      <CodeBlock className="language-jsx">
        {`<>\n\t<HeaderDescription icon="https://erxes.io/static/images/logo/logo_dark.svg" title="Title" description="Description" />\n</>`}
      </CodeBlock>
    </>
  );
}

import React from "react";
import TextDivider from "erxes-ui/lib/components/TextDivider";
import CodeBlock from "@theme/CodeBlock";
import dayjs from "dayjs";
import { renderApiTable } from "../common.js";

export function TextDividerComponent(props) {
  const { type, table = [] } = props;

  var localizedFormat = require("dayjs/plugin/localizedFormat");
  dayjs.extend(localizedFormat);

  const dates = new Date(new Date().getTime());

  if (type === "APItextdivider") {
    return renderApiTable("TextDivider", table);
  }

  return (
    <>
      <TextDivider text="Text divider text" date={dates} />
      <br />
      <CodeBlock className="language-jsx">
        {`<TextDivider text="Text divider" date="${dates}" />`}
      </CodeBlock>
    </>
  );
}

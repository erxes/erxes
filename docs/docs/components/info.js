import React from "react";
import Info from "erxes-ui/lib/components/Info";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Table from "../../../ui/src/modules/common/components/table";
import ApiTable from "./common.js"

export function InfoComponent(props) {
  const { type, types = [], icons = [], table = [] } = props;

  if (type === "infos") {
    return (
      <>
        <div>
          {types.map((e) => (
            <Info key={Math.random()} type={e.toLowerCase()} title={e}>
              {"This is "}{e.toLowerCase()}{" info"}
            </Info>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`${types.map(
            (e) => `\n\t<Info type="${e.toLowerCase()}" title="${e}">This is ${e.toLowerCase()} info</Info>`
          )}`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "icon") {
    return (
      <>
        <div>
          {types.map((e, index) => (
            <Info key={Math.random()} type={e.toLowerCase()} title={e} iconShow={icons[index]}>
              {"This is "}{e.toLowerCase()}{" info"}
            </Info>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>`}
          {`${types.map(
            (e, index) => `\n\t<Info type="${e.toLowerCase()}" title="${e}" iconShow="${icons[index]}">This is ${e.toLowerCase()} info</Info>`
          )}`}
          {`\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIinfo") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Info from "erxes-ui/lib/components/Info";`}</CodeBlock>
        {ApiTable(table)}
      </>
    );
  }

  return null;
}

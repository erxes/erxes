import React from "react";
import EmptyState from "erxes-ui/lib/components/EmptyState";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Button from "erxes-ui/lib/components/Button";
import ApiTable from "./common.js";

export function EmptyComponents(props) {
  const { type, table = [], img } = props;
  const text = "Text",
    size = "30",
    icon = "info-circle";
  if (type === "simple") {
    return (
      <>
        <div>
          <EmptyState icon={icon} text={text} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState icon="${icon}" text="${text}"/>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "light") {
    return (
      <>
        <div>
          <EmptyState icon={icon} text={text} light />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState icon="${icon}" text="${text}" light/>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "size") {
    return (
      <>
        <div>
          <EmptyState icon={icon} text={text} size={size} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState icon="${icon}" text="${text}" size="${size}"/>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "image") {
    return (
      <>
        <div>
          <EmptyState image={img} text={text} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState image="${img}" text="${text}"/>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "extra") {
    return (
      <>
        <div>
          <EmptyState icon={icon} text={text} extra={<Button>Button</Button>} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState icon="${icon}" text="${text}" extra={<Button>Button</Button>} />\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIempty") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import EmptyState from "erxes-ui/lib/components/EmptyState";`}</CodeBlock>
        {ApiTable(table)}
      </>
    );
  }

  return null;
}

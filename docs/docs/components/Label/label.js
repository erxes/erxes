import React from "react";
import Label from "erxes-ui/lib/components/Label";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../../src/components/styles.module.css";
import { renderApiTable } from "../common.js";

export function LabelComponent(props) {
  const { type, style = [], table = [] } = props;

  if (type === "lblStyle") {
    return (
      <>
        <div className={styles.styled}>
          {style.map((e) => (
            <Label key={Math.random()} lblStyle={e.toLowerCase()}>
              {e}
            </Label>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${style.map(
            (e) => `\n\t<Label lblStyle="${e.toLowerCase()}">${e}</Label>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  }
  if (type === "lblColor") {
    return (
      <>
        <div className={styles.styled}>
          {style.map((e) => (
            <Label key={Math.random()} lblColor={e.toLowerCase()}>
              {e}
            </Label>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${style.map(
            (e) => `\n\t<Label lblColor="${e.toLowerCase()}">${e}</Label>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  }
  if (type === "className") {
    return (
      <>
        <div className={styles.styled}>
          {style.map((e) => (
            <Label key={Math.random()} className={e.toLowerCase()}>
              Styled
            </Label>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${style.map(
            (e) => `\n\t<Label className=${e.toLowerCase()}>Styled</Label>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  }
  if (type === "children") {
    return (
      <>
        <div className={styles.styled}>
          {style.map((e) => (
            <Label key={Math.random()} children={e.toLowerCase()} />
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${style.map((e) => `\n\t<Label children="${e.toLowerCase()}"/>`)}\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIlabel") {
    return (
      <>
        {/* {Api("Label")}
        {ApiTable(table)} */}
      </>
    );
  }
  return null;
}

import React from "react";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import ApiTable from "./common.js";
import Button from "erxes-ui/lib/components/Button";

const renderButton = (buttons, type, icons) => {
  if (type === "size") {
    return (
      <>
        {buttons.map((e, i) => (
          <Button key={i} size={e.toLowerCase()}>
            {e}
          </Button>
        ))}
      </>
    );
  }

  if (type === "icon") {
    return (
      <>
        {buttons.map((e, i) => (
          <Button key={i} btnStyle={e.toLowerCase()} icon={icons[i]}>
            {e}
          </Button>
        ))}
      </>
    );
  }

  return (
    <>
      <Button>Default</Button>
      {buttons.map((e, i) => (
        <Button key={i} btnStyle={e.toLowerCase()}>
          {e}
        </Button>
      ))}
    </>
  );
};

const renderCode = (buttons, prop) => {
  if (prop === "size" || prop === "btnStyle") {
    return (
      <>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Button>Default</Button>${buttons.map(
            (e) => `\n\t<Button ${prop}="${e.toLowerCase()}">${e}</Button>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  }

  return (
    <>
      <CodeBlock className="language-jsx">
      {`<>\n\t<Button>Normal</Button>\n\t<Button ${prop.toLowerCase()}>{prop}</Button>\n</>`}
      </CodeBlock>
    </>
  );
};

export function ButtonComponent(props) {
  const { type, buttons = [], icons = [], table = [] } = props;

  if (type === "btnStyle" || type === "size") {
    return (
      <>
        <div className={styles.styled}>
          {renderButton(buttons, type)}
        </div>
          {renderCode(buttons, type)}
      </>
    );
  }

  if (type === "Disabled") {
    return (
      <>
        <div className={styles.styled}>
          <Button key={Math.random()} disabled>
            Disabled
          </Button>
        </div>
        {renderCode(buttons, type)}
      </>
    );
  }

  if (type === "Uppercase") {
    return (
      <>
        <div className={styles.styled}>
          <Button key={Math.random()} uppercase>
            Uppercase
          </Button>
        </div>
        {renderCode(buttons, type)}
      </>
    );
  }

  if (type === "Block") {
    return (
      <>
        <div className={styles.styled}>
          <Button key={Math.random()} block>
            Block
          </Button>
        </div>
        {renderCode(buttons, type)}
      </>
    );
  }

  if (type === "icon") {
    return (
      <>
        <div className={styles.styled}>
          {renderButton(buttons, type, icons)}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${buttons.map(
            (e, i) =>
              `\n\t<Button btnStyle="${e.toLowerCase()}" icon="${
                icons[i]
              }">${e}</Button>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIbutton") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Button from "erxes-ui/lib/components/Button";`}</CodeBlock>
        {ApiTable(table)}
      </>
    );
  }

  return null;
}

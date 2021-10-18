import React from "react";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import ApiTable from "./common.js";
import Button from "erxes-ui/lib/components/Button"

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
      {buttons.map((e, i) => (
        <Button key={i} btnStyle={e.toLowerCase()}>
          {e}
        </Button>
      ))}
    </>
  );
};

const renderCode = (buttons, prop) => {
  return (
    <>
      <CodeBlock className="language-jsx">
        {`<>`}
        {`\n\t<Button>Default</Button>`}
        {`${buttons.map(
          (e) => `\n\t<Button ${prop}="${e.toLowerCase()}">${e}</Button>`
        )}`}
        {`\n</>`}
      </CodeBlock>
    </>
  );
};

export function ButtonComponent(props) {
  const { type, buttons = [], icons = [], table = [] } = props;

  if (type === "type") {
    return (
      <>
        <div className={styles.styled}>
          <Button>Default</Button>
          {renderButton(buttons, type)}
        </div>
          {renderCode(buttons, "btnStyle")}
      </>
    );
  }

  if (type === "size") {
    return (
      <>
        <div className={styles.styled}>{renderButton(buttons, type)}</div>
        {renderCode(buttons, "size")}
      </>
    );
  }

  if (type === "activity") {
    return (
      <>
        <div className={styles.styled}>
          <Button key={Math.random()} disabled>
            Disabled
          </Button>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Button>Normal</Button>\n\t<Button disabled>Disabled</Button>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "uppercase") {
    return (
      <>
        <div className={styles.styled}>
          <Button key={Math.random()} uppercase>
            Uppercase
          </Button>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Button>Normal</Button>\n\t<Button uppercase>Uppercase</Button>\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "block") {
    return (
      <>
        <div className={styles.styled}>
          <Button key={Math.random()} block>
            Block
          </Button>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Button>Normal</Button>\n\t<Button block>Block</Button>\n</>`}
        </CodeBlock>
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
          {`<>`}
          {`${buttons.map(
            (e, index) =>
              `\n\t<Button btnStyle="${e.toLowerCase()}" icon="${
                icons[index]
              }">${e}</Button>`
          )}`}
          {`\n</>`}
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

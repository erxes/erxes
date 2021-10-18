import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import renderApiTable from "./common.js";
import "erxes-icon/css/erxes.min.css";

export function ButtonComponent(props) {
  const { type, buttons = [], icons = [], table = [] } = props;

  const renderBlock = (kind, propName, defaultBtn, icon) => {
    if (type === kind) {
      return (
        <>
          <div className={styles.styled}>
            {defaultBtn && <Button>{defaultBtn}</Button>}
            {buttons.map((btn, index) => {
              const props = {
                [propName]:
                  propName === "type" || propName === "size"
                    ? e.toLowerCase()
                    : true,
                icon: icon && icons[index],
              };

              return (
                <Button key={index} {...props}>
                  {btn}
                </Button>
              );
            })}
          </div>
          <CodeBlock className="language-jsx">
            {`<>\n\t<Button>${
              defaultBtn ? defaultBtn : "Default"
            }</Button>${buttons.map(
              (btn, index) =>
                `\n\t<Button key=${index} ${{ ...props }}>${btn}</Button>`
            )}\n</>`}
          </CodeBlock>
        </>
      );
    }
  };

  renderBlock("type", "btnStyle", "Default");
  renderBlock("size", "size");
  renderBlock("activity", "disabled", "Normal");
  renderBlock("uppercase", "uppercase", "Normal");
  renderBlock("block", "block", "Block");
  renderBlock("icon", "btnStyle", "Default", "icon");

  if (type === "APIbutton") {
    return renderApiTable("Button", table);
  }

  // if (type === "type") {
  //   return (
  //     <>
  //       <div className={styles.styled}>
  //         <Button>Default</Button>
  //         {buttons.map((e) => (
  //           <Button key={Math.random()} btnStyle={e.toLowerCase()}>
  //             {e}
  //           </Button>
  //         ))}
  //       </div>
  //       <CodeBlock className="language-jsx">
  //         {`<>`}
  //         {`\n\t<Button>Default</Button>`}
  //         {`${buttons.map(
  //           (e) => `\n\t<Button btnStyle="${e.toLowerCase()}">${e}</Button>`
  //         )}`}
  //         {`\n</>`}
  //       </CodeBlock>
  //     </>
  //   );
  // }

  // if (type === "size") {
  //   return (
  //     <>
  //       <div className={styles.styled}>
  //         {buttons.map((e) => (
  //           <Button key={Math.random()} size={e.toLowerCase()}>
  //             {e}
  //           </Button>
  //         ))}
  //       </div>
  //       <CodeBlock className="language-jsx">
  //         {`<>`}
  //         {`\n\t<Button>Default</Button>`}
  //         {`${buttons.map(
  //           (e) => `\n\t<Button size="${e.toLowerCase()}">${e}</Button>`
  //         )}`}
  //         {`\n</>`}
  //       </CodeBlock>
  //     </>
  //   );
  // }

  // if (type === "activity") {
  //   return (
  //     <>
  //       <div className={styles.styled}>
  //         <Button>Normal</Button>
  //         <Button key={Math.random()} disabled>
  //           Disabled
  //         </Button>
  //       </div>
  //       <CodeBlock className="language-jsx">
  //         {`<>`}
  //         {`\n\t<Button>Normal</Button>`}
  //         {`\n\t<Button disabled>Disabled</Button>`}
  //         {`\n</>`}
  //       </CodeBlock>
  //     </>
  //   );
  // }

  // if (type === "uppercase") {
  //   return (
  //     <>
  //       <div className={styles.styled}>
  //         <Button>Normal</Button>
  //         <Button key={Math.random()} uppercase>
  //           Uppercase
  //         </Button>
  //       </div>
  //       <CodeBlock className="language-jsx">
  //         {`<>`}
  //         {`\n\t<Button>Normal</Button>`}
  //         {`\n\t<Button uppercase>Uppercase</Button>`}
  //         {`\n</>`}
  //       </CodeBlock>
  //     </>
  //   );
  // }

  // if (type === "block") {
  //   return (
  //     <>
  //       <div className={styles.styled}>
  //         <Button key={Math.random()} block>
  //           Block
  //         </Button>
  //       </div>
  //       <CodeBlock className="language-jsx">
  //         {`<>`}
  //         {`\n\t<Button block>Block</Button>`}
  //         {`\n</>`}
  //       </CodeBlock>
  //     </>
  //   );
  // }

  // if (type === "icon") {
  //   return (
  //     <>
  //       <div className={styles.styled}>
  //         {buttons.map((e, index) => (
  //           <Button
  //             key={Math.random()}
  //             btnStyle={e.toLowerCase()}
  //             icon={icons[index]}
  //           >
  //             {e}
  //           </Button>
  //         ))}
  //       </div>
  //       <CodeBlock className="language-jsx">
  //         {`<>`}
  //         {`${buttons.map(
  //           (e, index) =>
  //             `\n\t<Button btnStyle="${e.toLowerCase()}" icon="${
  //               icons[index]
  //             }">${e}</Button>`
  //         )}`}
  //         {`\n</>`}
  //       </CodeBlock>
  //     </>
  //   );
  // }

  return null;
}

import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "./common.js";
import "erxes-icon/css/erxes.min.css";

export function ButtonComponent(props) {
  const { type, buttons = [], icons = [], table = [] } = props;

  const renderBlock = (kind, propName, defaultBtn, icon) => {
    console.log(type === kind, type, kind)
    if (type === kind) {
      console.log("aa")
      return (
        <>
          <div className={styles.styled}>
            {defaultBtn && <Button>{defaultBtn}</Button>}
            {buttons.map((btn, index) => {
              // const props = {
              //   [propName]:
              //     propName === "type" || propName === "size"
              //       ? btn.toLowerCase()
              //       : true,
              //   icon: icon && icons[index],
              // };
              console.log("bbb", propName, icon)
              return (
                <Button key={index} btnStyle="default">
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
                `\n\t<Button key=${index} >${btn}</Button>`
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


  return null;
}

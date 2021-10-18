import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "./common.js";
import "erxes-icon/css/erxes.min.css";

export function ButtonComponent(props) {
  const { type, buttons = [], icons = [], table = [] } = props;

  const renderBlock = (propName, defaultBtn, icon) => {
  
    return (
      <>
        <div className={styles.styled}>
          {defaultBtn && <Button>{defaultBtn}</Button>}
          {buttons.map((btn, index) => {
            const kind = {[propName]: propName === "btnStyle" || propName === "size"
            ? btn.toLowerCase()
            : true};

            const datas = {
              ...kind,
              icon: icon && icons[index],
            };
            // console.log(type, propName, datas)
            return (
              <Button key={index} {...datas}>
                {btn}
              </Button>
            );
          })}
        </div>

        <CodeBlock className="language-jsx">
          {`<>\n\t<Button>${
            defaultBtn ? defaultBtn : "Default"
          }</Button>${buttons.map(
            (btn) => `\n\t<Button>${btn}</Button>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  };
  console.log(type)
  if (type === "btnStyle") {
    return renderBlock("btnStyle", "Default");
  }

  if (type === "size") {
    return renderBlock("size");
  }

  if (type === "disabled") {
    return renderBlock("disabled", "Normal");
  }

  if (type === "uppercase") {
    return renderBlock("uppercase", "Normal");
  }

  if (type === "block") {
    return renderBlock("block");
  }

  if (type === "icon") {
    return renderBlock("btnStyle", "Default", "icon");
  }

  if (type === "APIbutton") {
    return renderApiTable("Button", table);
  }

  return null;
}

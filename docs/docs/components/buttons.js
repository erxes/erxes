import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "./common.js";
import "erxes-icon/css/erxes.min.css";

export function ButtonComponent(props) {
  const { type, buttons = [], icons = [], table = [] } = props;

  const renderBlock = ( propName, defaultBtn, icon) => {
      return (
        <>
          <div className={styles.styled}>
            {defaultBtn && <Button>{defaultBtn}</Button>}
            {buttons.map((btn, index) => {
              const props = {
                [propName]:
                  propName === "type" || propName === "size"
                    ? btn.toLowerCase()
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
              (btn) => `\n\t<Button ${{ ...props }}>${btn}</Button>`
            )}\n</>`}
          </CodeBlock>
        </>
      );
  };

  if (type === "type") {
    return renderBlock( "btnStyle", "Default");
  }

  if (type === "size") {
    return renderBlock( "size");
  }


  if (type === "APIbutton") {
    return renderApiTable("Button", table);
  }


  return null;
}

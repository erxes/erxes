import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function ButtonComponent(props) {
  const { type, buttons = [], icons = [], table = [] } = props;
  let string;

  const propDatas = (propName, btn, icon, index) => {
    const kind = {
      [propName]:
        propName === "btnStyle" || propName === "size"
          ? btn.toLowerCase()
          : true,
    };

    const datas = {
      ...kind,
      icon: icon && icons[index],
    };
    string = JSON.stringify(datas);
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/}/g, "");
    string = string.replace(/=true/g, "");

    return datas;
  };

  const renderBlock = (propName, defaultBtn, icon) => {
    return (
      <>
        <div className={styles.styled}>
          {defaultBtn && <Button>{defaultBtn}</Button>}

          {buttons.map((btn, index) => {
            return (
              <Button key={index} {...propDatas(propName, btn, icon, index)}>
                {btn}
              </Button>
            );
          })}
        </div>

        <CodeBlock className="language-jsx">
          {`<>\n\t<Button>${
            defaultBtn ? defaultBtn : "Default"
          }</Button>${buttons.map((btn, index) => {
            console.log(string);
            return `\n\t<Button ${string}>${btn}</Button>`;
          })}\n</>`}
        </CodeBlock>
      </>
    );
  };

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
    return renderBlock("btnStyle", "", "icon");
  }

  if (type === "APIbutton") {
    return renderApiTable("Button", table);
  }

  return null;
}

import React from "react";
import Button from "erxes-ui/lib/components/Button";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function ButtonComponent(props) {
  const { type, buttons = [], icons = [], table = [] } = props;

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
          {`<>${defaultBtn ? `\n\t<Button>${defaultBtn}</Button>` : ``}${buttons
            .map((btn, index) => {
              return `\n\t<Button ${stringify(
                propDatas(propName, btn, icon, index)
              )} >${btn}</Button>`;
            })
            .join(" ")}\n</>`}
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

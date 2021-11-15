import React from "react";
import Step from "erxes-ui/lib/components/step/Step";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function StepComponent(props) {
  const {
    logo,
    button,
    activenumber,
    stepnumber,
    titleof,
    child,
    type,
    table = []
  } = props;

  const nexted = () => {
    return alert("Next");
  };

  const click = () => {
    return alert("Clicked");
  };

  const propDatas = (propName) => {
    const kind = {
      [propName]: propName === "onClick" ? click : nexted,
      title: titleof,
      img: logo,
      noButton: button,
      active: activenumber,
      stepNumber: stepnumber,
      children: child,
    };
    return kind;
  };

  const renderBlock = (propName) => {
    return (
      <>
        <div className={styles.styled}>
          <Step {...propDatas(propName)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Step ${stringify(propDatas(propName))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "next") {
    return renderBlock("next");
  }

  if (type === "click") {
    return renderBlock("onCLick");
  }

  if (type === "APIstep") {
    return renderApiTable("Step", table);
  }

  return renderBlock();
}

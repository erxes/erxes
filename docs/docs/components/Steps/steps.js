import React from "react";
import Steps from "erxes-ui/lib/components/step/Steps";
import Step from "erxes-ui/lib/components/step/Step";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function StepComponent(props) {
  const { type, table = [] } = props;

  const propDatas = (propName, img) => {
    if (propName) {
      const kind = {
        [propName]:
          propName === "active" ? 2 : propName === "title" ? "Title" : true,
      };

      const data = {
        ...kind,
        img:
          img &&
          "https://erxes.io/static/images/logo/logo_dark.svg",
      };

      return data;
    } else {
      
      const data = {
        img: img && "https://erxes.io/static/images/logo/logo_dark.svg",
      };
      return data;
    }
  };

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/{}/g, "");
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/}/g, "");
    string = string.replace(/=true/g, "");
    string = string.replace(/2/g, "{2}");
    
    return string;
  }

  const renderBlockSteps = (propName) => {
    return (
      <>
        {propName === "noButton" ? (
          <div className={styles.styled}>
            <Steps>
              <Step
                noButton
                img="https://erxes.io/static/images/logo/logo_dark.svg"
              >
                children1
              </Step>
              <Step
                noButton
                img="https://erxes.io/static/images/logo/logo_dark.svg"
              >
                children2
              </Step>
              <Step
                noButton
                img="https://erxes.io/static/images/logo/logo_dark.svg"
              >
                children3
              </Step>
            </Steps>
          </div>
        ) : (
          <div className={styles.styled}>
            <Steps {...propDatas(propName)}>
              <Step img="https://erxes.io/static/images/logo/logo_dark.svg">
                children1
              </Step>
              <Step img="https://erxes.io/static/images/logo/logo_dark.svg">
                children2
              </Step>
              <Step img="https://erxes.io/static/images/logo/logo_dark.svg">
                children3
              </Step>
            </Steps>
          </div>
        )}
        <CodeBlock className="language-jsx">
          {`<>${
            propName === "noButton"
              ? `\n\t<Steps>\n\t\t<Step noButton img="https://erxes.io/static/images/logo/logo_dark.svg">children1</Step>\n\t\t<Step noButton img="https://erxes.io/static/images/logo/logo_dark.svg">children2</Step>\n\t\t<Step noButton img="https://erxes.io/static/images/logo/logo_dark.svg">children3</Step>\n\t</Steps>`
              : `\n\t<Steps ${stringify(
                  propDatas(propName)
                )}>\n\t\t<Step img="https://erxes.io/static/images/logo/logo_dark.svg">children1</Step>\n\t\t<Step img="https://erxes.io/static/images/logo/logo_dark.svg">children2</Step>\n\t\t<Step img="https://erxes.io/static/images/logo/logo_dark.svg">children3</Step>\n\t</Steps>`
          }\n</>`}
        </CodeBlock>
      </>
    );
  };

  const renderBlockStep = (propName) => {
    return (
      <>
        <div className={styles.styled}>
          <Step {...propDatas(propName, "img")}>children</Step>
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Step ${stringify(propDatas(propName, "img"))}>children</Step>\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "example") {
    return renderBlockSteps();
  }

  if (type === "activeSteps") {
    return renderBlockSteps("active");
  }

  if (type === "APIsteps") {
    return renderApiTable("Steps", table);
  }

  if (type === "img") {
    return renderBlockStep();
  }

  if (type === "title") {
    return renderBlockStep("title");
  }

  if (type === "nobtn") {
    return renderBlockSteps("noButton");
  }

  if (type === "APIstep") {
    return renderApiTable("Step", table);
  }

  return null;
}

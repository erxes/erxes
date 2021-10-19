import React from "react";
import ErrorMsg from "erxes-ui/lib/components/ErrorMsg";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable } from "../common.js";

export function ErrorMsgComponent(props) {
  const { table = [] } = props;

  const propDatas = (propName) => {
    const datas = {
      children: "This is error",
    };

    return datas;
  };

  const renderBlock = (propName) => {
    return (
      <>
        <div className={styles.styled}>
          <ErrorMsg {...propDatas(propName)} />
        </div>

        <CodeBlock className="language-jsx">
          {`<ErrorMsg children="${children}"/>`}
          {`<>\n\t<Button>${
            defaultBtn ? defaultBtn : "Default"
          }</Button>${buttons.map((btn, index) => {
            return `\n\t<Button ${propDatas(propName, btn, icon, index)} >${btn}</Button>`;
          })}\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (children) {
    return (
      <>
        <ErrorMsg children={children} />
        <CodeBlock className="language-jsx">
          {`<ErrorMsg children="${children}"/>`}
        </CodeBlock>
      </>
    );
  }
  if (table) {
    return <>{/* {Api("ErrorMsg")}
        {ApiTable(table)} */}</>;
  }
  return null;
}

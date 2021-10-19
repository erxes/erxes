import React from "react";
import Info from "erxes-ui/lib/components/Info";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable } from "../common.js";

export function InfoComponent(props) {
  const { type, table = [] } = props;
  const types = ["Primary", "Info", "Danger", "Warning", "Success"];
  const icons = [
    "envelope-alt",
    "info-circle",
    "times-circle",
    "exclamation-triangle",
    "check-circle",
  ];
  
  // const propDatas = (propName, icon, index) => {
  //   const kind = {
  //     [propName]:
  //       propName === "type"
  //         ? btn.toLowerCase()
  //         : true,
  //   };

  //   const datas = {
  //     ...kind,
  //     icon: icon && icons[index],
  //   };

  //   return datas;
  // };

  // const renderBlock = (propName, icon) => {
  //   console.log();
  //   return (
  //     <>
  //       <div className={styles.styled}>

  //         {types.map((info, index) => {
  //           return (
  //             <Info key={index} {...propDatas(propName, icon, index)}>
  //               {info}
  //             </Info>
  //           );
  //         })}
  //       </div>

  //       <CodeBlock className="language-jsx">
  //         {`<>\n\t<Button>${
  //           defaultBtn ? defaultBtn : "Default"
  //         }</Button>${buttons.map((btn, index) => {
  //           console.log(propDatas(propName, btn, icon, index));
  //           return `\n\t<Button ${JSON.stringify(
  //             propDatas(propName, btn, icon, index)
  //           )}>${btn}</Button>`;
  //         })}\n</>`}
  //       </CodeBlock>
  //     </>
  //   );
  // };

  if (type === "infos") {
    return (
      <>
        <div>
          {types.map((e) => (
            <Info key={Math.random()} type={e.toLowerCase()} title={e}>
              {"This is "}
              {e.toLowerCase()}
              {" info"}
            </Info>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${types.map(
            (e) =>
              `\n\t<Info type="${e.toLowerCase()}" title="${e}">This is ${e.toLowerCase()} info</Info>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "icon") {
    return (
      <>
        <div>
          {types.map((e, index) => (
            <Info
              key={Math.random()}
              type={e.toLowerCase()}
              title={e}
              iconShow={icons[index]}
            >
              {"This is "}
              {e.toLowerCase()}
              {" info"}
            </Info>
          ))}
        </div>
        <CodeBlock className="language-jsx">
          {`<>${types.map(
            (e, index) =>
              `\n\t<Info type="${e.toLowerCase()}" title="${e}" iconShow="${
                icons[index]
              }">This is ${e.toLowerCase()} info</Info>`
          )}\n</>`}
        </CodeBlock>
      </>
    );
  }

  if (type === "APIinfo") {
    return (
      <>
        {/* {Api("Info")}
        {ApiTable(table)} */}
      </>
    );
  }

  return null;
}

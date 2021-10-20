import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function CardComponent(props) {
  const { type, info, name, table = [] } = props;
  // let string;
  const propDatas = (propName, additional, fullName, email) => {


    const kind = {
      user: {[propName]: propName === "username" ? name : {[fullName]: name}},
      [additional]: info
    };
  
    const datas = {
      ...kind,
    };

    // string = JSON.stringify(datas);
    // string = string.replace(/{"/g, '');
    // string = string.replace(/":/g, '=');
    // string = string.replace(/,"/g, ' ');
    // string = string.replace(/}/g, '');

    return datas;
  };

  const renderBlock = (propName, additional, fullName, email) => {
    return (
      <>
        <div className={styles.styled}>
        <NameCard {...propDatas(propName, additional)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState ${JSON.stringify(propDatas(propName, additional, fullName, email))} />\n</>`}
        </CodeBlock>{" "}
      </>
    );
  };

  if (type === "username") {
    return renderBlock("username");
  }

  if (type === "avatarSize") {
    return renderBlock("username", "avatarSize");
  }

  // if (type === "usermail"){
  //   return renderBlock("usermail", "mail")
  // }

  // if (type === "fullName") {
  //   return renderBlock("details");
  // }

  // if (type === "usermail") {
  //   return (
  //     <>
  //       <div className={styles.styled}>
  //         <NameCard
  //           key={Math.random()}
  //           user={{ details: { fullName: name }, email: info }}
  //         ></NameCard>
  //       </div>
  //       <CodeBlock className="language-jsx">
  //         {`<>\n\t<NameCard user={{details:{fullName: "${name}"}, email: "${info}"}}></NameCard>\n</>`}
  //       </CodeBlock>
  //     </>
  //   );
  // }

  if (type === "secondLine") {
    return renderBlock("details", "secondLine", "fullName");
  }

  if (type === "APIcard") {
    return renderApiTable("NameCard", table);
  }

  return null;
}

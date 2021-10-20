import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify  } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function CardComponent(props) {
  const { type, info, name, mail, table = [] } = props;

  const propDatas = (propName, fullName, additional, email) => {
    const kind = {
      user: {
        [propName]: propName === "username" ? name : { [fullName]: name },
        email: mail,
      },
      [additional]: info,
    };

    const datas = {
      ...kind,
    };

    return datas;
  };

  const renderBlock = (propName, fullName, additional, email) => {
    return (
      <>
        <div className={styles.styled}>
          <NameCard {...propDatas(propName, fullName, additional, email)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<NameCard ${JSON.stringify(
            propDatas(propName, fullName, additional, email)
          )} />\n</>`}
        </CodeBlock>{" "}
      </>
    );
  };

  if (type === "username") {
    return renderBlock("username");
  }

  if (type === "avatarSize") {
    return renderBlock("details", "fullName", "avatarSize");
  }

  if (type === "usermail") {
    return renderBlock("details", "fullName", "usermail", "email");
  }

  if (type === "fullName") {
    return renderBlock("details", "fullName");
  }

  if (type === "secondLine") {
    return renderBlock("details", "fullName", "secondLine");
  }

  if (type === "APIcard") {
    return renderApiTable("NameCard", table);
  }

  return null;
}

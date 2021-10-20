import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function CardComponent(props) {
  const { type, info, name, mail, table = [] } = props;
  // let string;
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

    // string = JSON.stringify(datas);
    // string = string.replace(/{"/g, '');
    // string = string.replace(/":/g, '=');
    // string = string.replace(/,"/g, ' ');
    // string = string.replace(/}/g, '');

    return datas;
  };

  const renderBlock = (propName, fullName, additional, email) => {
    return (
      <>
        <div className={styles.styled}>
<<<<<<< HEAD
          <NameCard {...propDatas(propName, fullName, additional, email)} />
=======
        <NameCard {...propDatas(propName, additional, fullName)} />
>>>>>>> 00a4a7f611c4de9268d23ca0164d984414a4eeb5
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
<<<<<<< HEAD
    return renderBlock("details", "fullName", "secondLine");
=======
    return renderBlock("details", "", "fullName");
>>>>>>> 00a4a7f611c4de9268d23ca0164d984414a4eeb5
  }

  if (type === "APIcard") {
    return renderApiTable("NameCard", table);
  }

  return null;
}

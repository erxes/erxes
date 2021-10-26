import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import styles from "../../../src/components/styles.module.css";
import Table from "erxes-ui/lib/components/table/index";

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
    return (
    <>
      <CodeBlock className="language-javascript">{`import Namecard from "erxes-ui/lib/components/namecard/Namecard";`}</CodeBlock>
      <Table>
        <thead>
          <tr>
            <th colSpan="3">Name</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan="2">user</td>
            <td>details</td>
            <td>fullName</td>
            <td>string</td>
            <td>Fullname object of user. If you have details and username, it will only show detail</td>
          </tr>
          <tr>
            <td colSpan="2">email</td>
            <td>string</td>
            <td>Email object of user</td>
          </tr>
          <tr>
            <td colSpan="3">secondLine</td>
            <td>string</td>
            <td>Line below the username or full name. You can write anything in the second line</td>
          </tr>
          <tr>
            <td colSpan="3">avatarSize</td>
            <td>number</td>
            <td>Avatar size of your name card</td>
          </tr>
        </tbody>
      </Table>
    </>
    )
  }

  return null;
}

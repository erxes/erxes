import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../../src/components/styles.module.css";
import Table from "erxes-ui/lib/components/table/index";

export function CardComponent(props) {
  const { type, info, name, mail } = props;

  const propDatas = (propName, fullName, additional, email) => {
    const kind = {
      user: {
        [propName]: propName === "username" ? name : { [fullName]: name },
        email: email && mail,
      },
      [additional]: info,
    };

    const datas = {
      ...kind,
    };

    return datas;
  };

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/}},"/g, "}} ");
    string = string.replace(/},"/g, "}, ");
    string = string.replace(/},/g, "} ");
    string = string.replace(/":/g, ":");
    string = string.replace(/{"/g, "{");
    string = string.slice(1, string.length - 1);
    string = string.replace(/user:/g, "user=");
    string = string.replace(/singleLine:/g, "singleLine=");
    string = string.replace(/avatarSize:/g, "avatarSize=");
    string = string.replace(/secondLine:/g, "secondLine=");

    return string;
  }

  const renderBlock = (propName, fullName, additional, email) => {
    return (
      <>
        <div className={styles.styled}>
          <NameCard {...propDatas(propName, fullName, additional, email)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<NameCard ${stringify(
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

  if (type === "singleLine") {
    return renderBlock("details", "fullName", "singleLine", "email");
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
      <p className={styles.required}>* required prop</p>
      <Table>
        <thead>
          <tr>
            <th colSpan="3">Name</th>
            <th>Type</th>
            <th>Defualt</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td rowSpan="3">* user</td>
            <td colSpan="2">* username</td>
            <td>string</td>
            <td/>
            <td>Defines the username</td>
          </tr>
          <tr>
            <td>details</td>
            <td>fullName</td>
            <td>string</td>
            <td/>
            <td>Fullname object of user. If you have both "details" and "username", it will only show "details"</td>
          </tr>
          <tr>
            <td colSpan="2">email</td>
            <td>string</td>
            <td/>
            <td>Email object of user</td>
          </tr>
          <tr>
            <td colSpan="3">singleLine</td>
            <td>string</td>
            <td/>
            <td>Make the second line invisible</td>
          </tr>
          <tr>
            <td colSpan="3">secondLine</td>
            <td>string</td>
            <td/>
            <td>Line below the username or full name. You can write anything in the second line</td>
          </tr>
          <tr>
            <td colSpan="3">avatarSize</td>
            <td>number</td>
            <td>40</td>
            <td>Avatar size of your name card</td>
          </tr>
        </tbody>
      </Table>
    </>
    )
  }

  return null;
}

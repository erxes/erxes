import React from "react";
import NameCard from "erxes-ui/lib/components/nameCard/NameCard";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../../src/components/styles.module.css";
import Table from "erxes-ui/lib/components/table/index";

export function CardComponent(props) {
  const { type, info, name, mail } = props;

  const propDatas = (propName, fullName, additional, email) => {
    const kind = {
      [additional]: info,
      user: {
        [propName]: propName === "username" ? name : { [fullName]: name },
        email: email && mail,
      },
    };

    const datas = {
      ...kind,
    };

    return datas;
  };

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/":/g, ":");
    string = string.replace(/{"/g, "{");
    string = string.slice(1, string.length);
    string = string.replace(/,"user:/g, " user={");
    string = string.replace(/singleLine:true/g, " singleLine={true}");
    string = string.replace(/"email/g, "email");
    string = string.replace(/avatarSize:50/g, " avatarSize={50}");
    string = string.replace(/secondLine:/g, " secondLine=");
    string = string.replace(/user:/g, " user={");

    return string;
  };

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
        <p>
          <required>* required prop</required>
        </p>
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
              <td rowSpan="3">
                user<required>*</required>
              </td>
              <td colSpan="2">
                username<required>*</required>
              </td>
              <td>string</td>
              <td />
              <td>Defines the username</td>
            </tr>
            <tr>
              <td>details</td>
              <td>fullName</td>
              <td>string</td>
              <td />
              <td>
                Define fullname object of user. If you have both "details" and
                "username", it will only show "details"
              </td>
            </tr>
            <tr>
              <td colSpan="2">email</td>
              <td>string</td>
              <td />
              <td>Define email object of user</td>
            </tr>
            <tr>
              <td colSpan="3">singleLine</td>
              <td>string</td>
              <td />
              <td>Make the second line invisible</td>
            </tr>
            <tr>
              <td colSpan="3">secondLine</td>
              <td>string</td>
              <td />
              <td>
                Define line below the username or full name. You can write
                anything in the second line
              </td>
            </tr>
            <tr>
              <td colSpan="3">avatarSize</td>
              <td>number</td>
              <td>40</td>
              <td>Set avatar size to your name card</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

  return null;
}

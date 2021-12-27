import React from "react";
import Submenu from "erxes-ui/lib/components/subMenu/Submenu";
import Button from "erxes-ui/lib/components/Button";
import CodeBlock from "@theme/CodeBlock";
import Table from "erxes-ui/lib/components/table/index";
import styles from "../../../src/components/styles.module.css";

export function SubMenuComponent(props) {
  const { type, add } = props;
  const array = [
    { title: "Submenu 1", link: "" },
    { title: "Submenu 2", link: "" },
    { title: "Submenu 3", link: "" },
  ];

  const propDatas = (addition) => {
    const kind = {
      items: array,
      additionalMenuItem: add && addition,
    };
    return kind;
  };

  const stringify = (kind) => {
    let string = JSON.stringify(kind);
    string = string.replace(
      /}],"additionalMenuItem":"/g,
      "}]} additionalMenuItem={"
    );
    string = string.replace(/{"items":/g, "items={");
    string = string.replace(/":/g, ":");
    string = string.replace(/Additional item"}/g, 'Additional item"');
    string = string.replace(/}}/g, "}");
    string = string.replace(/"title/g, "title");
    string = string.replace(/"link/g, " link");
    string = string.replace(/>"/g, ">");

    return string;
  };

  const renderBlock = (additional, addition) => {
    return (
      <>
        <Submenu {...propDatas(additional)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<Submenu ${stringify(propDatas(addition))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "api") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Submenu from "erxes-ui/lib/components/subMenu/Submenu";`}</CodeBlock>
        <p>
          required prop - <span className={styles.required}>*</span>
        </p>
        <Table>
          <thead>
            <tr>
              <th colSpan="2">Name</th>
              <th>Type</th>
              <th>Defualt</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan="2">items (array)</td>
              <td>
                title<span className={styles.required}>*</span>
              </td>
              <td>string</td>
              <td />
              <td>Defines submenu title</td>
            </tr>
            <tr>
              <td>link</td>
              <td>string</td>
              <td />
              <td>Define the path of where to go when clicked</td>
            </tr>
            <tr>
              <td colSpan="2">additionalMenuItem</td>
              <td>React.ReactNode</td>
              <td />
              <td>
                Define additional sub menu item that will be displayed right
                side of sub menu
              </td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }
  return renderBlock(<Button>Additional item</Button>, `<Button>Additional item</Button>`);
}

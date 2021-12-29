import React from "react";
import EmptyContent from "erxes-ui/lib/components/empty/EmptyContent";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import Table from "erxes-ui/lib/components/table/index";

export function EmptyContentComponent(props) {
  const { type, value } = props;

  const step = () => {
    const steped = [];
    const st = {
      title: "Larry the Bird.",
      description:
        "Larry the Bird. Larry Joe Bird (born December 7, 1956) is an American former professional basketball player, coach and executive in the National Basketball Association (NBA). Nicknamed 'the Hick from French Lick' and 'Larry Legend,' Bird is widely regarded as one of the greatest basketball players of all time. ",
      url: type === "url" || type === "urltext" || type === "out" ? "/" : false,
      urlText: type === "urltext" || type === "out" ? "urlText" : false,
      icon: type === "icon" && "lightbulb-alt",
      isOutside: type === "out" && true,
    };
    if (type === "vertical") {
      steped.push(st);
    }
    steped.push(st);
    return steped;
  };

  const contentdata = (title, url) => {
    const datas = {
      title: title && title,
      description: title && "Description",
      steps: step(),
      url: url && url,
      urlText: url && "url Text",
    };
    return datas;
  };

  const propDatas = (propName, title, url) => {
    let kind;
    if (propName) {
      kind = {
        content: contentdata(title, url),
        [propName]: value,
      };
    } else {
      kind = {
        content: contentdata(title, url),
      };
    }
    return kind;
  };

  const stringify = (kind, datas) => {
    let string = JSON.stringify(kind, datas);
    string = string.replace(/,"url":false/g, "");
    string = string.replace(/,"urlText":false/g, "");
    string = string.replace(/,"icon":false/g, "");
    string = string.replace(/,"isOutside":false/g, "");
    string = string.replace(/":/g, ":");
    string = string.replace(/{"/g, "{");
    string = string.slice(1, string.length);
    string = string.replace(/content:/g, " content={");
    string = string.replace(/,"/g, ', ');
    string = string.replace(/, vertical:/g, "} vertical={");
    string = string.replace(/, maxItemWidth:/g, "} maxItemWidth=");
    string = string.replace(/300px"}/g, '300px"');

    return string;
  };

  const renderBlock = (title, propName, url) => {
    return (
      <>
        <EmptyContent {...propDatas(propName, title, url)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyContent ${stringify(
            propDatas(propName, title, url)
          )} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "contentTitle") {
    return renderBlock("Title");
  }

  if (type === "contenturl") {
    return renderBlock("Title", "", "url");
  }

  if (type === "vertical") {
    return renderBlock("Title", "vertical", "");
  }

  if (type === "max") {
    return renderBlock("Title", "maxItemWidth", "");
  }

  if (type === "APIempty") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Namecard from "erxes-ui/lib/components/namecard/Namecard";`}</CodeBlock>
        <p><required>* required prop</required></p>
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
              <td rowSpan="10">content<required>*</required></td>
              <td rowSpan="6">steps</td>
              <td>title</td>
              <td>string</td>
              <td />
              <td>Define title of step</td>
            </tr>
            <tr>
              <td>description</td>
              <td>string</td>
              <td />
              <td>Define description of step</td>
            </tr>
            <tr>
              <td>url</td>
              <td>string</td>
              <td />
              <td>Define url of button</td>
            </tr>
            <tr>
              <td>urlText</td>
              <td>string</td>
              <td />
              <td>Define url text of button</td>
            </tr>
            <tr>
              <td>icon</td>
              <td>string</td>
              <td />
              <td>Replace step number with icon</td>
            </tr>
            <tr>
              <td>isOutside</td>
              <td>boolean</td>
              <td />
              <td>Hides button link</td>
            </tr>
            <tr>
              <td colSpan="2">title</td>
              <td>string</td>
              <td />
              <td>Define title of content</td>
            </tr>
            <tr>
              <td colSpan="2">description</td>
              <td>string</td>
              <td />
              <td>Define description of content</td>
            </tr>
            <tr>
              <td colSpan="2">url</td>
              <td>string</td>
              <td />
              <td>Define url link of content</td>
            </tr>
            <tr>
              <td colSpan="2">urlText</td>
              <td>string</td>
              <td />
              <td>Define url text of content</td>
            </tr>
            <tr>
              <td colSpan="3">vertical</td>
              <td>boolean</td>
              <td />
              <td>Shows content box vertically</td>
            </tr>
            <tr>
              <td colSpan="3">maxItemWidth</td>
              <td>string</td>
              <td />
              <td>Declare max width of content box</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

  return renderBlock();
}

import React from "react";
import Attachment from "erxes-ui/lib/components/Attachment";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import Table from "erxes-ui/lib/components/table/index";

export function AttachmentComponent(props) {
  const { type, additionalItem, simple } = props;

  const image = {
    name: "logo_dark.svg",
    type: "image",
    url: "https://erxes.io/static/images/logo/logo_dark.svg",
  };

  const video = {
    name: "test.mp4",
    type: "video",
    url: "/home/ariuka/Documents/test.mp4",
  };

  const file = {
    name: "test.docx",
    type: "text",
    url: "/home/ariuka/Documents/test.docx",
  };

  const fileSize = {
    name: "test.docx",
    type: "text",
    url: "/home/ariuka/Documents/test.docx",
    size: 4179,
  };

  // const multi = [
  //   {
  //     name: "test.docx",
  //     type: "text",
  //     url: "/home/ariuka/Documents/test.docx",
  //   },
  //   {
  //     name: "test.docx",
  //     type: "text",
  //     url: "/home/ariuka/Documents/test.docx",
  //   },
  //   {
  //     name: "test.docx",
  //     type: "text",
  //     url: "/home/ariuka/Documents/test.docx",
  //   },
  // ];

  const propDatas = (attachments) => {
    const kind = {
      attachment:
        type === "image"
          ? image
          : type === "video"
          ? video
          : type === "fileSize"
          ? fileSize
          : file,
      additionalItem: additionalItem && "Additional text",
      simple: simple && true,
      // attachments: attachments && multi,
    };
    return kind;
  };

  const stringify = (kind) => {
    let string = JSON.stringify(kind);
    string = string.replace(/}},"/g, "}} ");
    string = string.replace(/},"/g, "} ");
    string = string.replace(/":/g, ":");
    string = string.replace(/,"/g, ",");
    string = string.replace(/{"/g, "{");
    string = string.replace(/name=/g, "name:");
    string = string.replace(/:/g, "=");
    string = string.slice(1, string.length - 1);
    string = string.replace(/=true/g, "");

    return string;
  };

  const renderBlock = (attachments) => {
    return (
      <>
        <div className={styles.styled}>
          <Attachment {...propDatas(attachments)} index={5} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Attachment ${stringify(propDatas(attachments))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  // if (type === "multi") {
  //   return renderBlock("attachments");
  // }

  if (type === "APIattachment") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Attachment from "erxes-ui/lib/components/Attachment";`}</CodeBlock>
        <p className={styles.required}>* required prop</p>
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
              <td rowSpan="4">* attachment</td>
              <td >* name</td>
              <td>string</td>
              <td/>
              <td>File name</td>
            </tr>
            <tr>
              <td>* type</td>
              <td>string</td>
              <td/>
              <td>File type</td>
            </tr>
            <tr>
              <td >* url</td>
              <td>string</td>
              <td/>
              <td>File url</td>
            </tr>
            <tr>
              <td>size</td>
              <td>number</td>
              <td/>
              <td>File size</td>
            </tr>
            <tr>
              <td colSpan="2">additionalItem</td>
              <td>node</td>
              <td/>
              <td>Additional item can be any node</td>
            </tr>
            <tr>
              <td colSpan="2">simple</td>
              <td>boolean</td>
              <td></td>
              <td>Show only image</td>
            </tr>
          </tbody>
        </Table>
      </>
      )
  }

  return renderBlock();
}

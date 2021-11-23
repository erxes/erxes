import React from "react";
import Attachment from "erxes-ui/lib/components/Attachment";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import Table from "erxes-ui/lib/components/table/index";

export function AttachmentComponent(props) {
  const { type, additionalItem, simple, index } = props;

  const image = {
    name: "logo_dark.svg",
    type: "image",
    url: "https://erxes.io/static/images/logo/logo_dark.svg",
  };

  const video = { name: "test.mp4", type: "video", url: "/Documents/test.mp4" };

  const file = { name: "test.docx", type: "text", url: "/Documents/test.docx" };

  const fileSize = {
    name: "test.docx",
    type: "text",
    url: "/Documents/test.docx",
    size: 4179,
  };

  const audio = { name: "test.mp3", type: "mp3", url: "/Documents/test.mp3" };

  const multi = [
    {
      name: "glyph_dark.svg",
      type: "text",
      url: "https://erxes.io/static/images/logo/glyph_dark.svg",
    },
    {
      name: "glyph_dark.png",
      type: "text",
      url: "https://erxes.io/static/images/logo/glyph_dark.png",
    },
  ];

  const propDatas = (attachments) => {
    const datas = {
      attachment:
        type === "image" || type === "multi"
          ? {
              name: "logo_dark.svg",
              type: "image",
              url: "https://erxes.io/static/images/logo/logo_dark.svg",
            }
          : type === "video"
          ? { name: "test.mp4", type: "video", url: "/Documents/test.mp4" }
          : type === "fileSize"
          ? {
              name: "test.docx",
              type: "text",
              url: "/Documents/test.docx",
              size: 4179,
            }
          : type === "audio"
          ? { name: "test.mp3", type: "mp3", url: "/Documents/test.mp3" }
          : { name: "test.docx", type: "text", url: "/Documents/test.docx" },
      additionalItem: additionalItem && "Additional text",
      simple: simple && true,
      attachments: attachments && [
        {
          name: "glyph_dark.svg",
          type: "image",
          url: "https://erxes.io/static/images/logo/glyph_dark.svg",
        },
        { name: "test.mp4", type: "video", url: "/Documents/test.mp4" },
      ],
      index: index && 1,
    };
    return datas;
  };

  const stringify = (kind) => {
    let string = JSON.stringify(kind);
    string = string.replace(/}},"/g, "}} ");
    string = string.replace(/},"/g, "} ");
    string = string.replace(/":/g, ":");
    string = string.replace(/,"/g, ",");
    string = string.replace(/{"/g, "{");
    string = string.replace(/attachment:/g, "attachment=");
    string = string.replace(/attachments:/g, "attachments={");
    string = string.replace(/additionalItem:/g, "additionalItem=");
    string = string.replace(/:true/g, "");
    string = string.replace(/}]/g, "}]}");
    string = string.slice(1, string.length - 1);
    string = string.replace(/=true/g, "");
    string = string.replace(/name/g, "\n\t\tname");
    string = string.replace(/type/g, "\n\t\ttype");
    string = string.replace(/url/g, "\n\t\turl");
    string = string.replace(/}/g, "}\n\t");
    string = string.replace(/,index:/g, "index=");

    return string;
  };

  const renderBlock = (attachments) => {
    return (
      <>
        <div className={styles.styled}>
          <Attachment {...propDatas(attachments)} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Attachment ${stringify(
            propDatas(attachments)
          )} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "multi") {
    return renderBlock("attachments");
  }

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
              <td>* name</td>
              <td>string</td>
              <td />
              <td>Define file name</td>
            </tr>
            <tr>
              <td>* type</td>
              <td>string</td>
              <td />
              <td>Define file type</td>
            </tr>
            <tr>
              <td>* url</td>
              <td>string</td>
              <td />
              <td>Declare file path</td>
            </tr>
            <tr>
              <td>size</td>
              <td>number</td>
              <td />
              <td>Shows file size</td>
            </tr>
            <tr>
              <td colSpan="2">scrollBottom</td>
              <td>function</td>
              <td />
              <td></td>
            </tr>
            <tr>
              <td colSpan="2">additionalItem</td>
              <td>React.ReactNode</td>
              <td />
              <td>Add additional item</td>
            </tr>
            <tr>
              <td colSpan="2">simple</td>
              <td>boolean</td>
              <td></td>
              <td>Shows only image</td>
            </tr>
            <tr>
              <td colSpan="2">index</td>
              <td>number</td>
              <td></td>
              <td>When reviewing attachments, define which file to start from</td>
            </tr>
            <tr>
              <td rowSpan="4">attachments (array)</td>
              <td>* name</td>
              <td>string</td>
              <td />
              <td>Define file name</td>
            </tr>
            <tr>
              <td>* type</td>
              <td>string</td>
              <td />
              <td>Define file type</td>
            </tr>
            <tr>
              <td>* url</td>
              <td>string</td>
              <td />
              <td>Declare file path</td>
            </tr>
            <tr>
              <td>size</td>
              <td>number</td>
              <td />
              <td>Shows file size</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

  return renderBlock();
}

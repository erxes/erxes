import React from "react";
import Attachment from "erxes-ui/lib/components/Attachment";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import Table from "erxes-ui/lib/components/table/index";
import { renderApiTable } from "../common.js";

export function AttachmentComponent(props) {
  const { type, additionalItem, simple, index, attachments } = props;

  const propDatas = () => {
    const datas = {
      attachment:
        type === "image" || type === "multi"
          ? {
              name: "logo_dark.svg",
              type: "image",
              url: "https://erxes.io/static/images/logo/logo_dark.svg",
            }
          : type === "video"
          ? { name: "video.mp4", type: "video", url: "/Documents/video.mp4" }
          : type === "fileSize"
          ? {
              name: "text.docx",
              type: "text",
              url: "/Documents/test.docx",
              size: 4179,
            }
          : type === "audio"
          ? { name: "audio.mp3", type: "mp3", url: "/Documents/audio.mp3" }
          : { name: "text.docx", type: "text", url: "/Documents/test.docx" },
      additionalItem: additionalItem && "Additional text",
      simple: simple && true,
      attachments: attachments && [
        {
          name: "glyph_dark.svg",
          type: "image",
          url: "https://erxes.io/static/images/logo/glyph_dark.svg",
        },
        { name: "flag_right.svg", type: "image", url: "https://erxes.io/static/images/logo/flag_right.svg" },
      ],
      index: index && 1,
      scrollBottom: () => {},
    };
    return datas;
  };

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/}},"/g, "}} ");
    string = string.replace(/},"/g, "} ");
    string = string.replace(/":/g, ":");
    string = string.replace(/,"/g, ",");
    string = string.replace(/{"/g, "{");
    string = string.replace(/:true/g, "");
    string = string.replace(/:/g, "=");
    string = string.replace(/attachments=/g, "attachments={");
    string = string.replace(/,index/g, " index");
    string = string.replace(/}]/g, "}]}");
    string = string.slice(1, string.length - 1);
    string = string.replace(/=true/g, "");
    string = string.replace(/name=/g, "\n\t\tname:");
    string = string.replace(/type=/g, "\n\t\ttype:");
    string = string.replace(/url=/g, "\n\t\turl:");
    string = string.replace(/}/g, "}\n\t");
    string = string.replace(/,index:/g, "index=");

    return string;
  };

  const renderBlock = () => {
    return (
      <>
        <div className={styles.styled}>
          <Attachment {...propDatas()} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Attachment ${stringify(
            propDatas()
          )} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIattachment") {
    return (
      <>
        {renderApiTable("Attachment")}
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
              <td rowSpan="4">attachment*</td>
              <td>name*</td>
              <td>string</td>
              <td />
              <td>Define file name</td>
            </tr>
            <tr>
              <td>type*</td>
              <td>string</td>
              <td />
              <td>Define file type</td>
            </tr>
            <tr>
              <td>url*</td>
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
              <td>Define function that runs after the image finished loading</td>
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
              <td>name*</td>
              <td>string</td>
              <td />
              <td>Define file name</td>
            </tr>
            <tr>
              <td>type*</td>
              <td>string</td>
              <td />
              <td>Define file type</td>
            </tr>
            <tr>
              <td>url*</td>
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

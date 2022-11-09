import React from "react";
import Uploader from "erxes-ui/lib/components/Uploader";
import CodeBlock from "@theme/CodeBlock";
import styles from "../../../src/components/styles.module.css";
import Table from "erxes-ui/lib/components/table/index";

export function UploaderComponent(props) {
  const { singl, multi, lmt, type, defaultFiles, table = [] } = props;

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/{}/g, "");
    string = string.replace(/{"/g, "{");
    string = string.replace(/":/g, ":");
    string = string.replace(/,"/g, ", ");
    string = string.replace(/:true/g, "");
    string = string.replace(/:false/g, "={false}");
    string = string.replace(/:2/g, "={2}");
    string = string.replace(/]/g, "\n\t]}");
    string = string.slice(1, string.length - 1);
    string = string.replace(/defaultFileList:/g, "defaultFileList={");
    string = string.replace(/{name/g, "\n\t\t{name");

    return string;
  };

  const files = [
    {
      name: "testFile.docx",
      type: "text",
      url: "/home/ariuka/Documents/test.docx",
    },
    {
      name: "testFile2.docx",
      type: "text",
      url: "/home/ariuka/Documents/test.docx",
    },
  ];

  const propDatas = () => {
    const datas = {
      single: singl,
      multiple: multi,
      limit: lmt,
      defaultFileList: defaultFiles && files,
    };

    return datas;
  };

  const renderBlock = () => {
    return (
      <>
        <div className={styles.styled}>
          <Uploader {...propDatas()} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Uploader ${stringify(propDatas())} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIuploader") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Uploader from "erxes-ui/lib/components/Uploader";`}</CodeBlock>
        <p><required>* required prop</required></p>
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
              <td rowSpan="4">defaultFileList<required>*</required> (array)</td>
              <td>name<required>*</required></td>
              <td>string</td>
              <td />
              <td>Define file name</td>
            </tr>
            <tr>
              <td>type<required>*</required></td>
              <td>string</td>
              <td />
              <td>Define file type</td>
            </tr>
            <tr>
              <td>url<required>*</required></td>
              <td>string</td>
              <td />
              <td>Define file path</td>
            </tr>
            <tr>
              <td>size</td>
              <td>number</td>
              <td />
              <td>Define file size</td>
            </tr>
            <tr>
              <td colSpan="2">onChange</td>
              <td>function</td>
              <td />
              <td>Adding attachments</td>
            </tr>
            <tr>
              <td colSpan="2">single</td>
              <td>boolean</td>
              <td />
              <td>Makes the uploader inactive to upload files</td>
            </tr>
            <tr>
              <td colSpan="2">limit</td>
              <td>number</td>
              <td />
              <td>Sets limit to files</td>
            </tr>
            <tr>
              <td colSpan="2">multiple</td>
              <td>boolean</td>
              <td />
              <td>Define it can upload multiple files or only one file</td>
            </tr>
          </tbody>
        </Table>
      </>
    );
  }

  return renderBlock();
}

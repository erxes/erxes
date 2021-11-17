import React from "react";
import Uploader from "erxes-ui/lib/components/Uploader";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function UploaderComponent(props) {
  const { singl, multi, lmt, type, defaultFiles, table=[] } = props;
    
  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/{}/g, "");
    string = string.replace(/{"/g, "{");
    string = string.replace(/":/g, ":");
    string = string.replace(/,"/g, " ");
    string = string.replace(/:true/g, "");
    string = string.replace(/:false/g, "=false");
    string = string.replace(/:2/g, "=2");
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
      single : singl,
      multiple: multi,
      limit: lmt,
      defaultFileList: defaultFiles && files,
    };

      return datas;
    };

  const renderBlock = () => {
    return(
      <>
        <div className={styles.styled}>
          <Uploader {...propDatas()} />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<Uploader ${stringify(
            propDatas()
          )} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIuploader") {
    return renderApiTable("Uploader", table);
  }

  return renderBlock();
}

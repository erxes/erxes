import React from "react";
import FilePreview from "erxes-ui/lib/components/FilePreview";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";

export function FilePreviewComponent(props) {
  const { url, name, type, table = [] } = props;

  const propDatas = (fileName) => {
    const kind = {
      fileUrl: url,
      fileName: fileName && name,
    };

    return kind;
  };

  const renderBlock = (fileName) => {
    return (
      <>
        <FilePreview {...propDatas(fileName)} />
        <CodeBlock className="language-jsx">
          {`<>\n\t<FilePreview ${stringify(propDatas(fileName))} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIfilepreview") {
    return renderApiTable("FilePreview", table);
  }

  return renderBlock("fileName");
}

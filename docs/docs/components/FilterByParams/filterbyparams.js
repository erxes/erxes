import React from "react";
import FilterByParams from "erxes-ui/lib/components/FilterByParams";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";

export function FilterByParamsComponent(props) {
  const { url, name, type, table = [] } = props;

  //   const propDatas = (fileName) => {
  //     const kind = {
  //       fileUrl: url,
  //       fileName: fileName && name,
  //     };

  //     return kind;
  //   };

  //   const renderBlock = (fileName) => {
  //     return (
  //       <>
  //         <FilePreview {...propDatas(fileName)} />
  //         <CodeBlock className="language-jsx">
  //           {`<>\n\t<FilePreview ${stringify(propDatas(fileName))} />\n</>`}
  //         </CodeBlock>
  //       </>
  //     );
  //   };

  //   if (type === "APIfilepreview") {
  //     return renderApiTable("FilePreview", table);
  //   }

  return (
    <>
      <h1>normal</h1>
      <FilterByParams
        fields={[
          { _id: "0", type: "tag", name: "Field1", colorCode: "blue" },
          { _id: "1", type: "tag", name: "sield2", colorCode: "green" },
          { _id: "2", type: "tag", name: "dield3", colorCode: "yellow" },
        ]}
        counts={0}
        searchable
        multiple
      />

      <h1>normal</h1>
      <FilterByParams
        fields={[
          { _id: "0", type: "tag", name: "Field1", colorCode: "blue" },
          { _id: "1", type: "tag", name: "Field2", colorCode: "green" },
          { _id: "2", type: "tag", name: "Field3", colorCode: "yellow" },
        ]}
        counts={0}
        multiple
      />
    </>
  );
}

import React from "react";
import Uploader from "erxes-ui/lib/components/Uploader";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function UploaderComponent(props) {
  const { singl, multi, lmt, type, table = [] } = props;

  const propDatas = () => {
    const datas = {
      defaultFileList: {name: "name", type: "img", size: 10, url: "https://erxes.io/static/images/logo/logo_dark.svg"},
      single: singl,
      multiple: multi,
      limit: lmt,
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
    return renderApiTable("Uploader", table);
  }

  return renderBlock();
}

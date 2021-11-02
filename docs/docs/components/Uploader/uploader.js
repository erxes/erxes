import React from "react";
import Uploader from "erxes-ui/lib/components/Uploader";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function UploaderComponent(props) {
<<<<<<< HEAD
const { singl, multi, lmt, type, table=[] } = props;
  
const propDatas = () => {
  const datas = {
    single : singl,
    multiple: multi,
    limit: lmt,
  };
=======
  const { singl, multi, lmt, type, table = [] } = props;

  const propDatas = (single, multiple, limit) => {
    const datas = {
      single: singl,
      multiple: multi,
      limit: lmt,
    };
>>>>>>> 253474b3615a86fe6781ba69f64dbde07d08bf47

    return datas;
  };

<<<<<<< HEAD
const renderBlock = () => {
  return(
    <>
    <Uploader {...propDatas()} />
    <CodeBlock className="language-jsx">
=======
  const renderBlock = (single, multiple, limit) => {
    return (
      <>
        <div className={styles.styled}>
          <Uploader {...propDatas(single, multiple, limit)} />
        </div>
        <CodeBlock className="language-jsx">
>>>>>>> 253474b3615a86fe6781ba69f64dbde07d08bf47
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

<<<<<<< HEAD
return renderBlock();
}
=======
  return renderBlock("single", "multiple", "limit");
}
>>>>>>> 253474b3615a86fe6781ba69f64dbde07d08bf47

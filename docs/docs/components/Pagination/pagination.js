import React from "react";
import Pagination from "erxes-ui/lib/components/pagination/Pagination";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function PaginationComponent(props) {
  const { number, type, table = [] } = props;

  const propDatas = () => {
    const kind = {
      count: number,
    }

    return kind;
  }

  const stringify = (kind) => {
    let string = JSON.stringify(kind);
    string = string.replace(/{}/g, "");
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "={");
    
    return string;
  }

  if (type === "APIpagination") {
    return (
      <>
        <CodeBlock className="language-javascript">{`import Pagination from "erxes-ui/lib/components/pagination/Pagination";`}</CodeBlock>
        {renderApiTable("", table)}
      </>
    );
  }

  return (
    <>
      <Pagination {...propDatas()} />
      <CodeBlock className="language-jsx">
        {`<>\n\t<Pagination ${stringify(propDatas())} />\n</>`}
        </CodeBlock>
    </>
  );
}

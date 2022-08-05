import React from "react";
import DataWithLoader from "erxes-ui/lib/components/DataWithLoader";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function DatawithLoaderComponent(props) {
  const { counter, text, image, sizes, type, table = [] } = props;

  const propDatas = (loading, propName, propImage, count, size) => {
    const kind = {
      data: "This is data",
      loading: loading ? true : false,
      [propName]:
        propName === "emptyText" ||
        propName === "emptyContent" ||
        propName === "loadingContent"
          ? text
          : true,
      [propImage]:
        propImage === "emptyIcon" || propImage === "emptyImage" ? image : true,
      [count]: count && counter,
      [size]: size && sizes,
    };

    return kind;
  };

  const stringify = (datas) => {
    let string = JSON.stringify(datas);
    string = string.replace(/0/g, "{0}");
    string = string.replace(/{"/g, "");
    string = string.replace(/":/g, "=");
    string = string.replace(/,"/g, " ");
    string = string.replace(/=true/g, "");
    string = string.replace(/false/g, "{false}");
    string = string.slice(0, string.length - 1);

    return string;
  }

  const renderBlock = (
    loading,
    propName,
    propImage,
    count,
    size
  ) => {
    return (
      <>
        <div className={styles.styled}>
          <DataWithLoader
            {...propDatas(loading, propName, propImage, count, size)}
          />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<DataWithLoader ${stringify(
            propDatas(loading, propName, propImage, count, size)
          )} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "loadtrue") {
    return renderBlock("loading", "objective");
  }

  if (type === "loadingcontent") {
    return renderBlock("loading", "loadingContent");
  }
  if (type === "loadfalse") {
    return renderBlock("");
  }

  if (type === "count") {
    return renderBlock("", "emptyContent", "", "count");
  }

  if (type === "emptystateicon") {
    return renderBlock("", "emptyText", "emptyIcon", "count", "size");
  }

  if (type === "emptystateimage") {
    return renderBlock("", "emptyText", "emptyImage", "count", "size");
  }

  if (type === "APIdatewithloader") {
    return renderApiTable("DataWithLoader", table);
  }

  return null;
}

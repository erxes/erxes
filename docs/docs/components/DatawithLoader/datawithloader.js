import React from "react";
import DataWithLoader from "erxes-ui/lib/components/DataWithLoader";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function DatawithLoaderComponent(props) {
  const { counter, text, image, sizes, type, table = [] } = props;

  const propDatas = (loading, objective, propName, propImage, count, size) => {
    const kind = {
      data: "This is data",
      loading: loading ? true : false,
      [objective]: objective && true,
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

  const renderBlock = (
    loading,
    objective,
    propName,
    propImage,
    count,
    size
  ) => {
    return (
      <>
        <div className={styles.styled}>
          <DataWithLoader
            {...propDatas(loading, objective, propName, propImage, count, size)}
          />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<EmptyState ${stringify(
            propDatas(loading, objective, propName, propImage, count, size)
          )} />\n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "loadtrue") {
    return renderBlock("loading", "objective");
  }

  if (type === "loadingcontent") {
    return renderBlock("loading", "objective", "loadingContent");
  }
  if (type === "loadfalse") {
    return renderBlock("");
  }

  if (type === "count") {
    return renderBlock("", "", "emptyContent", "", "count");
  }

  if (type === "emptystate") {
    return renderBlock("", " ", "emptyText", "emptyIcon", "count", "size");
  }

  if (type === "APIdatewithloader") {
    return renderApiTable("DataWithLoader", table);
  }

  return null;
}

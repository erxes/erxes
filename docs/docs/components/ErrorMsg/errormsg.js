import React from "react";
import ErrorMsg from "erxes-ui/lib/components/ErrorMsg";
import FilterByParams from "erxes-ui/lib/components/FilterByParams";
import CodeBlock from "@theme/CodeBlock";
import "erxes-icon/css/erxes.min.css";
import { renderApiTable } from "../common.js";
import { Tag } from "react-feather";

export function ErrorMsgComponent(props) {
  const { table = [], children } = props;
  // const array = [{ _id: 0, name: "Name"}, { _id: 1, name: "Age"}, { _id: 2, name: "School"}];

  // const child = (field) => {
  //   return <div>{field.name}</div>;
  // };

  // const onChangeFields = () => {
  //   return <div>{field.name}</div>;
  // };

  if (children) {
    return (
      <>
        <FilterByParams
          fields={[
            { _id: "0", type: "tag", name: "field1", colorCode: "blue" },
            { _id: "1", type: "tag", name: "field2", colorCode: "green" },
            { _id: "2", type: "tag", name: "field3", colorCode: "yellow" },
          ]}
          counts={0}
          loading
        />
        {/* <SortableList fields={array} child={child} showDragHandler={false} droppableId={0} /> */}
        <ErrorMsg>{children}</ErrorMsg>
        <CodeBlock className="language-jsx">
          {`<ErrorMsg>${children}</ErrorMsg>`}
        </CodeBlock>
      </>
    );
  }

  if (table) {
    return renderApiTable("ErrorMsg", table);
  }

  return null;
}

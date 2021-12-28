import React from "react";
import SortableList from "erxes-ui/lib/components/SortableList";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function SortableListComponent(props) {
  const array = [
    { _id: 0, field: "James" },
    { _id: 1, field: "Robert" },
    { _id: 2, field: "Larry" },
  ];

  const [fields, setFields] = React.useState(array);
  const { type, table = [] } = props;

  const child = (array) => {
    return <div> {array.field}</div>;
  };

  const onChangeFields = (fields) => {
    setFields(fields);
  };

  const renderBlock = () => {
    return (
      <>
        <div className={styles.styled}>
          <SortableList
            fields={fields}
            child={child}
            onChangeFields={onChangeFields}
          />
        </div>
        <CodeBlock className="language-jsx">
          {`  const array = [\n\t{ _id: 0, field: "James" },\n\t{ _id: 1, field: "Robert" },\n\t{ _id: 2, field: "Larry" },\n   ];

  const [fields, setFields] = React.useState(array);
  const { type, table = [] } = props;

  const child = (array) => {
    return <div> {array.field}</div>;
  };

  const onChangeFields = (fields) => {
    setFields(fields);
  };

  const renderBlock = () => {
    return <SortableList
              fields={fields}
              child={child}
              onChangeFields={onChangeFields}
            />\n  };
            
  return renderBlock("");`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIsortablelist") {
    return renderApiTable("Sortablelist", table);
  }

  return renderBlock("");
}

import React from "react";
import SortableList from "erxes-ui/lib/components/SortableList";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function SortableListComponent() {
  const child = (field) => {
    let array = [["Name"], ["Age"]];
    return array;
  };
  return (
    <>
      <SortableList
        fields={[{ _id: 1 }, { _id: 2 }, { _id: 3 }]}
        child={child}
        isDragDisabled={false}
      />
    </>
  );
}

import React from "react";
import SortableList from "erxes-ui/lib/components/SortableList";
import styles from "../../../src/components/styles.module.css";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import "erxes-icon/css/erxes.min.css";

export function SortableListComponent() {
  const names = []
  return (<>
  <SortableList fields={names}>
  </SortableList>
  </>)
}
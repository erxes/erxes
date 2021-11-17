import React from "react";
import SortableList from "erxes-ui/lib/components/SortableList";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";
import styles from "../../../src/components/styles.module.css";

export function SortableListComponent(props) {
  const { type, table = [] } = props;

  const arrays = ["Name", "Age", "School"];

  const propDatas = () => {
    let array = [];

    arrays.map((arr, index) => {
      array.push({ _id: index, name: arr });
    });

    return array;
  };

  const child = (array) => {
    return <div> {array.name}</div>;
  };

  // function onChangeItems(updatedItems, destinationIndex) {
  // setItems(updatedItems);
  // props.updateOrderItems(updatedItems[destinationIndex], destinationIndex);
  // }

  const onChangeFields = (array) => {
    let scr = source.name;
    let dest = destination.name;
    let extra;
    (src) => extra;
    (dest) => src;
    (extra) => dest;
  };

  const renderBlock = () => {
    return (
      <>
        <div className={styles.styled}>
          <SortableList
            fields={propDatas()}
            child={child}
            isDragDisabled="true"
            showDragHandler="false"
            onChangeFields={onChangeFields}
            droppableId="droppable"
          />
        </div>
        <CodeBlock className="language-jsx">
          {`<>\n\t<SortableList
          fields={propDatas()}
          child={child}
          // isDragDisabled={true}
          // showDragHandler={false}
          onChangeFields={onChangeFields}
          droppableId="droppable"
        /> \n</>`}
        </CodeBlock>
      </>
    );
  };

  if (type === "APIsortablelist") {
    return renderApiTable("Sortablelist", table);
  }

  return renderBlock("");
}

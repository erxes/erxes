import React from "react";
import SortableList from "erxes-ui/lib/components/SortableList";
import CodeBlock from "@theme/CodeBlock";
import { renderApiTable, stringify } from "../common.js";

export function SortableListComponent() {
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
    let extra ;
    src => extra; 
    dest => src;
    extra => dest;
  };

  const renderBlock = () => {
    return (
      <>
        <SortableList
          fields={propDatas()}
          child={child}
          // isDragDisabled={true}
          // showDragHandler={false}
          onChangeFields={onChangeFields}
          droppableId="droppable"
        />
      </>
    );
  };

  return renderBlock("");
}

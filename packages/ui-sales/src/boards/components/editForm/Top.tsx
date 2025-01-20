import { IItem, IOptions } from "../../types";

import DueDateChooser from "./DueDateChooser";
import Header from "./Header";
import { HeaderContent } from "../../styles/item";
import Move from "../../containers/editForm/Move";
import React from "react";
import { __ } from "@erxes/ui/src/utils/core";

type Props = {
  item: IItem;
  options: IOptions;
  stageId: string;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onChangeStage?: (stageId: string) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  amount?: () => React.ReactNode;
};

function Top(props: Props) {
  function renderMove() {
    const { stageId, options, onChangeStage, item } = props;

    return (
      <Move
        options={options}
        item={item}
        stageId={stageId}
        onChangeStage={onChangeStage}
      />
    );
  }

  const { saveItem, amount, onUpdate, item } = props;

  return (
    <React.Fragment>
      <Header item={item} saveItem={saveItem} amount={amount} />
      <HeaderContent>{renderMove()}</HeaderContent>
      <DueDateChooser item={item} saveItem={saveItem} onUpdate={onUpdate} />
    </React.Fragment>
  );
}

export default Top;

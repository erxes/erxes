import {
  ChooseDates,
  HeaderContent,
  HeaderContentSmall,
  HeaderRow,
  TitleRow,
} from "../../styles/item";
import { IItem, IOptions } from "../../types";
import React, { useEffect, useState } from "react";

import CloseDate from "./CloseDate";
import { ColorButton } from "../../styles/common";
import { ControlLabel } from "@erxes/ui/src/components/form";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import Icon from "@erxes/ui/src/components/Icon";
import Move from "../../containers/editForm/Move";
import { PRIORITIES } from "../../constants";
import PriorityIndicator from "./PriorityIndicator";
import SelectItem from "../SelectItem";
import StartDate from "./StartDate";
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
  const { item } = props;

  const [name, setName] = useState(item.name);

  useEffect(() => {
    setName(item.name);
  }, [item.name]);

  function renderMove() {
    const { stageId, options, onChangeStage } = props;

    return (
      <Move
        options={options}
        item={item}
        stageId={stageId}
        onChangeStage={onChangeStage}
      />
    );
  }

  const { saveItem, amount, onUpdate } = props;

  const onNameBlur = () => {
    if (item.name !== name) {
      saveItem({ name });
    }
  };

  const onCloseDateFieldsChange = (key: string, value: any) => {
    saveItem({ [key]: value });
  };

  const onPriorityChange = (value: string) => {
    if (saveItem) {
      saveItem({ priority: value }, (updatedItem) => {
        onUpdate(updatedItem);
      });
    }
  };

  const onChangeName = (e) => {
    const itemName = (e.target as HTMLInputElement).value;

    setName(itemName);
    localStorage.setItem(`${props.item._id}Name`, itemName);
  };

  const renderScore = () => {
    const { score } = item;

    if (!score) {
      return null;
    }

    return (
      <HeaderContentSmall>
        <ControlLabel>Score</ControlLabel>
        <p>{score.toLocaleString()}</p>
      </HeaderContentSmall>
    );
  };

  const priorityTrigger = (
    <ColorButton>
      {item.priority ? (
        <PriorityIndicator value={item.priority} />
      ) : (
        <Icon icon="sort-amount-up" />
      )}
      {item.priority ? item.priority : __("Priority")}
    </ColorButton>
  );

  return (
    <React.Fragment>
      <HeaderRow>
        <HeaderContent>
          <TitleRow>
            <Icon icon="atm-card" />
            <FormControl
              componentclass="textarea"
              value={name}
              required={true}
              onBlur={onNameBlur}
              onChange={onChangeName}
            />
          </TitleRow>
        </HeaderContent>
        {renderScore()}
        {amount && amount()}
      </HeaderRow>

      <HeaderContent>{renderMove()}</HeaderContent>
      <FormGroup>
        <TitleRow>
          <ControlLabel uppercase={true}>
            {__("Due date, priority")}
          </ControlLabel>
        </TitleRow>
        <ChooseDates>
          <StartDate
            onChangeField={onCloseDateFieldsChange}
            startDate={item.startDate}
            reminderMinute={item.reminderMinute}
          />
          {__("to")}
          <CloseDate
            onChangeField={onCloseDateFieldsChange}
            closeDate={item.closeDate}
            isCheckDate={item.pipeline.isCheckDate}
            createdDate={item.createdAt}
            reminderMinute={item.reminderMinute}
            isComplete={item.isComplete}
          />
          <SelectItem
            items={PRIORITIES}
            selectedItems={item.priority}
            onChange={onPriorityChange}
            trigger={priorityTrigger}
          />
        </ChooseDates>
      </FormGroup>
    </React.Fragment>
  );
}

export default Top;

import { ChooseDates, TitleRow } from "../../styles/item";

import CloseDate from "./CloseDate";
import { ColorButton } from "../../styles/common";
import { ControlLabel } from "@erxes/ui/src/components/form";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IItem } from "../../types";
import Icon from "@erxes/ui/src/components/Icon";
import { PRIORITIES } from "../../constants";
import PriorityIndicator from "./PriorityIndicator";
import React from "react";
import SelectItem from "../SelectItem";
import StartDate from "./StartDate";
import { __ } from "@erxes/ui/src/utils/core";

type Props = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
};

function DueDateChooser(props: Props) {
  const { item, saveItem, onUpdate } = props;

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
    <FormGroup>
      <TitleRow>
        <ControlLabel uppercase={true}>{__("Due date, priority")}</ControlLabel>
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
  );
}

export default DueDateChooser;

import DueDateChanger from '@erxes/ui-cards/src/boards/components/DueDateChanger';
import { ArchiveBtn } from '@erxes/ui-cards/src/boards/components/editForm/ArchiveBtn';
import PriorityIndicator from '@erxes/ui-cards/src/boards/components/editForm/PriorityIndicator';
import SelectItem from '@erxes/ui-cards/src/boards/components/SelectItem';
import { PRIORITIES } from '@erxes/ui-cards/src/boards/constants';
import { Watch } from '@erxes/ui-cards/src/boards/containers/editForm/';
import LabelChooser from '@erxes/ui-cards/src/boards/containers/label/LabelChooser';
import { ColorButton } from '@erxes/ui-cards/src/boards/styles/common';
import { ActionContainer } from '@erxes/ui-cards/src/boards/styles/item';
import { IOptions } from '@erxes/ui-cards/src/boards/types';
import ChecklistAdd from '@erxes/ui-cards/src/checklists/components/AddButton';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils/core';
import { IGrowthHack } from '../../types';
import React from 'react';
import { HACKSTAGES } from '@erxes/ui-cards/src/boards/constants';
import Vote from '../../containers/Vote';

type Props = {
  item: IGrowthHack;
  onChangeField: (
    name: 'labels' | 'priority' | 'hackStages',
    value: any
  ) => void;
  dateOnChange: (date) => void;
  options: IOptions;
  copy: () => void;
  onUpdate: (item, prevStageId?: string) => void;
  sendToBoard?: (item: any) => void;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  removeItem: (itemId: string) => void;
  onChangeStage?: (stageId: string) => void;
  onChangeRefresh: () => void;
};

class Actions extends React.Component<Props> {
  render() {
    const {
      item,
      onChangeField,
      options,
      copy,
      removeItem,
      saveItem,
      sendToBoard,
      dateOnChange,
      onUpdate,
      onChangeStage,
      onChangeRefresh
    } = this.props;

    const hackStages = item.hackStages || [];

    const priorityOnChange = (value: string) => {
      onChangeField('priority', value);
    };
    const onLabelChange = labels => {
      onChangeField('labels', labels);
    };

    const hackStageOnChange = (value: string) => {
      if (hackStages.includes(value)) {
        const remainedValues = hackStages.filter(i => {
          return i !== value;
        });

        return onChangeField('hackStages', remainedValues);
      }

      const values = hackStages.concat(value);

      return onChangeField('hackStages', values);
    };

    const priorityTrigger = (
      <ColorButton>
        {item.priority ? (
          <PriorityIndicator value={item.priority} />
        ) : (
          <Icon icon="sort-amount-up" />
        )}
        {__('Priority')}
      </ColorButton>
    );

    const hackStageTrigger = (
      <ColorButton>
        <Icon icon="diary" />
        {__('Growth funnel')}
      </ColorButton>
    );

    return (
      <ActionContainer>
        <DueDateChanger value={item.closeDate} onChange={dateOnChange} />
        <SelectItem
          items={PRIORITIES}
          selectedItems={item.priority}
          onChange={priorityOnChange}
          trigger={priorityTrigger}
        />
        <SelectItem
          items={HACKSTAGES}
          selectedItems={hackStages}
          onChange={hackStageOnChange}
          trigger={hackStageTrigger}
          multiple={true}
        />
        <Vote item={item} onUpdate={onUpdate} />
        <LabelChooser
          item={item}
          onSelect={onLabelChange}
          onChangeRefresh={onChangeRefresh}
        />
        <ChecklistAdd itemId={item._id} type={options.type} />
        <Watch item={item} options={options} isSmall={true} />
        <ColorButton onClick={copy}>
          <Icon icon="copy-1" />
          {__('Copy')}
        </ColorButton>
        <ArchiveBtn
          item={item}
          removeItem={removeItem}
          saveItem={saveItem}
          sendToBoard={sendToBoard}
          onChangeStage={onChangeStage}
        />
      </ActionContainer>
    );
  }
}

export default Actions;

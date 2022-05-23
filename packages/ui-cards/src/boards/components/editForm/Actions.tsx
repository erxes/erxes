import SelectItem from '../../components/SelectItem';
import { PRIORITIES } from '../../constants';
import Watch from '../../containers/editForm/Watch';
import LabelChooser from '../../containers/label/LabelChooser';
import { ColorButton } from '../../styles/common';
import { ActionContainer } from '../../styles/item';
import { IItem, IOptions } from '../../types';
import ChecklistAdd from '../../../checklists/components/AddButton';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { ArchiveBtn } from './ArchiveBtn';
import PriorityIndicator from './PriorityIndicator';

type Props = {
  item: IItem;
  options: IOptions;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
  sendToBoard?: (item: any) => void;
  onChangeStage?: (stageId: string) => void;
  onChangeRefresh: () => void;
};

class Actions extends React.Component<Props> {
  onPriorityChange = (value: string) => {
    const { onUpdate, saveItem } = this.props;

    if (saveItem) {
      saveItem({ priority: value }, updatedItem => {
        onUpdate(updatedItem);
      });
    }
  };

  render() {
    const {
      item,
      saveItem,
      options,
      copyItem,
      removeItem,
      sendToBoard,
      onChangeStage,
      onChangeRefresh
    } = this.props;

    const onLabelChange = labels => saveItem({ labels });

    const priorityTrigger = (
      <ColorButton>
        {item.priority ? (
          <PriorityIndicator value={item.priority} />
        ) : (
          <Icon icon="sort-amount-up" />
        )}
        {item.priority ? item.priority : __('Priority')}
      </ColorButton>
    );

    return (
      <ActionContainer>
        <SelectItem
          items={PRIORITIES}
          selectedItems={item.priority}
          onChange={this.onPriorityChange}
          trigger={priorityTrigger}
        />

        <LabelChooser
          item={item}
          onSelect={onLabelChange}
          onChangeRefresh={onChangeRefresh}
        />

        <ChecklistAdd itemId={item._id} type={options.type} />

        <Watch item={item} options={options} isSmall={true} />

        <ColorButton onClick={copyItem}>
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

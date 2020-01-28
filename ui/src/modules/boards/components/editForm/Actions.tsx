import SelectItem from 'modules/boards/components/SelectItem';
import { PRIORITIES } from 'modules/boards/constants';
import Watch from 'modules/boards/containers/editForm/Watch';
import LabelChooser from 'modules/boards/containers/label/LabelChooser';
import { ColorButton } from 'modules/boards/styles/common';
import { ActionContainer } from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import ChecklistAdd from 'modules/checklists/components/AddButton';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import PriorityIndicator from './PriorityIndicator';

type Props = {
  item: IItem;
  options: IOptions;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onUpdate: (item: IItem, prevStageId?: string) => void;
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
    const { item, saveItem, options, copyItem, removeItem } = this.props;

    const onRemove = () => removeItem(item._id);
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

        <LabelChooser item={item} onSelect={onLabelChange} />

        <ChecklistAdd itemId={item._id} type={options.type} />

        <Watch item={item} options={options} isSmall={true} />

        <ColorButton onClick={copyItem}>
          <Icon icon="copy-1" />
          {__('Copy')}
        </ColorButton>

        <ColorButton onClick={onRemove}>
          <Icon icon="times-circle" />
          {__('Delete')}
        </ColorButton>
      </ActionContainer>
    );
  }
}

export default Actions;

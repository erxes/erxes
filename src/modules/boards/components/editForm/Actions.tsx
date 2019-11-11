import SelectItem from 'modules/boards/components/SelectItem';
import { PRIORITIES } from 'modules/boards/constants';
import { Watch } from 'modules/boards/containers/editForm/';
import LabelChooser from 'modules/boards/containers/label/LabelChooser';
import { ColorButton } from 'modules/boards/styles/common';
import { ActionContainer } from 'modules/boards/styles/item';
import { IOptions } from 'modules/boards/types';
import ChecklistAdd from 'modules/checklists/components/AddButton';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { IGrowthHack } from 'modules/growthHacks/types';
import React from 'react';

type Props = {
  item: IGrowthHack;
  options: IOptions;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  saveItem: (doc: { [key: string]: any }, callback?: (item) => void) => void;
  onUpdate: (item, prevStageId?: string) => void;
};

type State = {
  priority: string;
};

class Actions extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      priority: props.item.priority || ''
    };
  }

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
        <Icon icon="sort-amount-up" />
        {__('Priority')}
      </ColorButton>
    );

    return (
      <ActionContainer>
        {options.type !== 'deal' && (
          <SelectItem
            items={PRIORITIES}
            selectedItems={item.priority}
            onChange={this.onPriorityChange}
            trigger={priorityTrigger}
          />
        )}

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

import DueDateChanger from 'modules/boards/components/DueDateChanger';
import PriorityIndicator from 'modules/boards/components/editForm/PriorityIndicator';
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
import { HACKSTAGES } from '../../constants';
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
  remove: (id: string) => void;
  onUpdate: (item, prevStageId?: string) => void;
};

class Actions extends React.Component<Props> {
  render() {
    const {
      item,
      onChangeField,
      options,
      copy,
      remove,
      dateOnChange,
      onUpdate
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

    const onRemove = () => remove(item._id);

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
        <LabelChooser item={item} onSelect={onLabelChange} />
        <ChecklistAdd itemId={item._id} type={options.type} />
        <Watch item={item} options={options} isSmall={true} />
        <ColorButton onClick={copy}>
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

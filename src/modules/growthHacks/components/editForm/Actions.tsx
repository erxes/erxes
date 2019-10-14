import DueDateChanger from 'modules/boards/components/DueDateChanger';
import SelectItem from 'modules/boards/components/SelectItem';
import { PRIORITIES } from 'modules/boards/constants';
import { Watch } from 'modules/boards/containers/editForm/';
import { ColorButton } from 'modules/boards/styles/common';
import { ActionContainer } from 'modules/boards/styles/item';
import { IOptions } from 'modules/boards/types';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import { IGrowthHack } from 'modules/growthHacks/types';
import React from 'react';
import { HACKSTAGES } from '../../constants';
import Vote from '../../containers/Vote';

type Props = {
  item: IGrowthHack;
  onChangeField: (name: 'priority' | 'hackStages', value: any) => void;
  closeDate: Date;
  priority: string;
  hackStages: string[];
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
      closeDate,
      priority,
      hackStages,
      options,
      copy,
      remove,
      dateOnChange,
      onUpdate
    } = this.props;

    const priorityOnChange = (value: string) => {
      onChangeField('priority', value);
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
        <Icon icon="sort-amount-up" />
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
        <DueDateChanger value={closeDate} onChange={dateOnChange} />
        <SelectItem
          items={PRIORITIES}
          selectedItems={priority}
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

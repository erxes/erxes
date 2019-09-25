import { TitleRow } from 'modules/boards/styles/item';
import { FormControl } from 'modules/common/components/form';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import React from 'react';
import AddItemForm from '../containers/AddItemForm';
import { IChecklist } from '../types';

type Props = {
  checklists: IChecklist[];
  removeChecklist: (checklistId: string) => void;
  removeChecklistItem: (checklistItemId: string) => void;
};

class Checklists extends React.Component<Props> {
  renderChecklistItem = item => {
    const { removeChecklistItem } = this.props;

    const onClick = () => removeChecklistItem(item._id);

    return (
      <TitleRow>
        <FormControl
          componentClass="checkbox"
          checked={item.isChecked}
          value="{item.content}"
          placeholder={item.content}
        />
        <button onClick={onClick}>
          <Icon icon="times-circle" />
        </button>
      </TitleRow>
    );
  };

  renderAddItem = checklist => {
    const trigger = (
      <button>
        <Icon icon="focus-add" />
        {__('Add item')}
      </button>
    );

    const renderAddItem = () => {
      return <AddItemForm checklist={checklist} />;
    };

    return (
      <ModalTrigger
        title="Add Item"
        trigger={trigger}
        content={renderAddItem}
      />
    );
  };

  renderChecklistItems = checklist => {
    if (!checklist.checklistItems) {
      return null;
    }

    return checklist.checklistItems.map(item => this.renderChecklistItem(item));
  };

  renderChecklist = checklist => {
    const { removeChecklist } = this.props;

    const onClick = () => removeChecklist(checklist._id);
    return (
      <>
        <TitleRow>
          <ControlLabel>
            <Icon icon="checked" />
            {__(`${checklist.title}`)}
          </ControlLabel>
          <button onClick={onClick}>
            <Icon icon="cancel" />
          </button>
        </TitleRow>
        <TitleRow>
          <ControlLabel>{__(`${checklist.checklistPercent}`)}</ControlLabel>
        </TitleRow>
        <TitleRow>{this.renderChecklistItems(checklist)}</TitleRow>
        <TitleRow>{this.renderAddItem(checklist)}</TitleRow>
      </>
    );
  };

  render() {
    const { checklists } = this.props;
    if (checklists.length === 0) {
      return null;
    }

    return checklists.map(checklist => this.renderChecklist(checklist));
  }
}

export default Checklists;

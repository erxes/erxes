import { TitleRow } from 'modules/boards/styles/item';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IChecklist } from '../types';

type Props = {
  checklists: IChecklist[];
  removeChecklist: (checklistId: string) => void;
  removeChecklistItem: (checklistId: string) => void;
};

class Checklists extends React.Component<Props> {
  renderChecklistItem = item => {
    const { removeChecklistItem } = this.props;

    const onClick = () => removeChecklistItem(item._id);

    return (
      <TitleRow>
        <ControlLabel>
          <Icon icon="checked" />
          {__(`${item.content}`)}
        </ControlLabel>
        <button onClick={onClick}>
          <Icon icon="cancel" />
        </button>
      </TitleRow>
    );
  };

  renderChecklistItems = checklist => {
    if (checklist.checklistItems) {
      checklist.checklistItems.map(item => this.renderChecklistItem(item));
    }

    return 'addItem';
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
          {this.renderChecklistItems(checklist)}
        </TitleRow>
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

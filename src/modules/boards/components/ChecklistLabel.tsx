import Icon from 'modules/common/components/Icon';
import * as React from 'react';
import { IChecklistsState } from '../../checklists/types';

type IProps = {
  checklistsState: IChecklistsState;
};

class ChecklistsLabel extends React.Component<IProps> {
  render() {
    const { checklistsState } = this.props;

    if (!checklistsState || checklistsState.all === 0) {
      return null;
    }

    return (
      <label>
        <Icon icon="check-square" />
        {checklistsState.complete} / {checklistsState.all}
      </label>
    );
  }
}

export default ChecklistsLabel;

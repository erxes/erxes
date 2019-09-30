import Icon from 'modules/common/components/Icon';
import * as React from 'react';

type IProps = {
  checklistsState: any;
};

class ChecklistsLabel extends React.Component<IProps> {
  render() {
    const { checklistsState } = this.props;

    if (!checklistsState) {
      return null;
    }

    return (
      <label>
        <Icon icon="check-square" />
        {checklistsState.completed} / {checklistsState.all}
      </label>
    );
  }
}

export default ChecklistsLabel;

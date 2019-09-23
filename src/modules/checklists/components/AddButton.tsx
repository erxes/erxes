import { RightButton } from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import AddForm from '../containers/AddForm';

type IProps = {
  item: IItem;
  options: IOptions;
};

class ChecklistAdd extends React.Component<IProps> {
  render() {
    const onClick = () => {
      return <AddForm {...this.props} />;
    };
    return (
      <RightButton icon="checklist" onClick={onClick}>
        {__('Add Checklist')}
      </RightButton>
    );
  }
}

export default ChecklistAdd;

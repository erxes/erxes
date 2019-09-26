import { RightButton } from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import AddForm from '../containers/AddForm';

type IProps = {
  item: IItem;
  options: IOptions;
};

class ChecklistAdd extends React.Component<IProps> {
  render() {
    const addTrigger = (
      <RightButton icon="checked">{__('Add Checklist')}</RightButton>
    );

    const renderForm = props => {
      return <AddForm {...props} {...this.props} />;
    };

    return (
      <ModalTrigger
        title="New checklist"
        trigger={addTrigger}
        content={renderForm}
      />
    );
  }
}

export default ChecklistAdd;

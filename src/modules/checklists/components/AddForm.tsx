import { RightButton } from 'modules/boards/styles/item';
import { IItem } from 'modules/boards/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';

type IProps = {
  item: IItem;
};

class AddForm extends React.Component<IProps> {
  render() {
    return <RightButton icon="checklist">{__('Add Checklist')}</RightButton>;
  }
}

export default AddForm;

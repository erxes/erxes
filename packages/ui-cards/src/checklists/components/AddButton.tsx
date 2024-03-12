import { ColorButton } from '../../boards/styles/common';
import Icon from '@erxes/ui/src/components/Icon';
import { __ } from '@erxes/ui/src/utils';
import * as React from 'react';
import Popover from '@erxes/ui/src/components/Popover';
import AddForm from '../containers/AddForm';
import { Wrapper } from '@erxes/ui/src/styles/main';
import { Title } from '../../boards/styles/label';

type Props = {
  itemId: string;
  type: string;
};

class ChecklistAdd extends React.Component<Props> {
  private overlayTrigger;

  hidePopover = () => {
    this.overlayTrigger.hide();
  };

  renderForm() {
    return (
      <>
        <Title>Add checklist</Title>
        <Wrapper>
          <AddForm {...this.props} afterSave={this.hidePopover} />
        </Wrapper>
      </>
    );
  }

  render() {
    return (
      <Popover
        placement="bottom-start"
        trigger={
          <ColorButton>
            <Icon icon="check-square" />
            {__('Checklist')}
          </ColorButton>
        }
      >
        {this.renderForm()}
      </Popover>
    );
  }
}

export default ChecklistAdd;

import { RightButton } from 'modules/boards/styles/item';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import AddForm from '../containers/AddForm';
import { PopoverContent } from '../styles';

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
      <Popover id="checklist-popover">
        <Popover.Title as="h3">Add checklist</Popover.Title>
        <Popover.Content>
          <PopoverContent>
            <AddForm {...this.props} afterSave={this.hidePopover} />
          </PopoverContent>
        </Popover.Content>
      </Popover>
    );
  }

  render() {
    const addTrigger = (
      <RightButton icon="check-square">{__('Add Checklist')}</RightButton>
    );

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={this.renderForm()}
        rootClose={true}
      >
        {addTrigger}
      </OverlayTrigger>
    );
  }
}

export default ChecklistAdd;

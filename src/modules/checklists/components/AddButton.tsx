import { RightButton } from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import AddForm from '../containers/AddForm';
import { PopoverContent } from '../styles';

type Props = {
  item: IItem;
  options: IOptions;
};

class ChecklistAdd extends React.Component<Props> {
  private overlayTrigger;

  hidePopover = () => {
    this.overlayTrigger.hide();
  };

  renderForm() {
    return (
      <Popover id="checklist-popover" title="Add checklist">
        <PopoverContent>
          <AddForm {...this.props} afterSave={this.hidePopover} />
        </PopoverContent>
      </Popover>
    );
  }

  render() {
    const addTrigger = (
      <RightButton icon="checked">{__('Add Checklist')}</RightButton>
    );

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="top"
        overlay={this.renderForm()}
        rootClose={true}
      >
        {addTrigger}
      </OverlayTrigger>
    );
  }
}

export default ChecklistAdd;

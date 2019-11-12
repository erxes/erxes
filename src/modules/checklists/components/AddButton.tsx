import { ColorButton } from 'modules/boards/styles/common';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
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
      <Popover id="checklist-popover" title="Add checklist">
        <PopoverContent>
          <AddForm {...this.props} afterSave={this.hidePopover} />
        </PopoverContent>
      </Popover>
    );
  }

  render() {
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
        <ColorButton>
          <Icon icon="checked" />
          {__('Checklist')}
        </ColorButton>
      </OverlayTrigger>
    );
  }
}

export default ChecklistAdd;

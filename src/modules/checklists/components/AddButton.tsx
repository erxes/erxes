import { RightButton } from 'modules/boards/styles/item';
import { IItem, IOptions } from 'modules/boards/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import AddForm from '../containers/AddForm';
import { PopoverContent } from '../styles';

type IProps = {
  item: IItem;
  options: IOptions;
  afterSave?: () => void;
};

class ChecklistAdd extends React.Component<IProps> {
  private overlayTrigger;

  hidePopover = () => {
    const { afterSave } = this.props;

    if (afterSave) {
      afterSave();
    }

    this.overlayTrigger.hide();
  };

  renderForm(props) {
    return (
      <Popover id="checklist-popover">
        <PopoverContent>
          <h5>Add Checklist</h5>
          <AddForm {...props} {...this.props} afterSave={this.hidePopover} />
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
        overlay={this.renderForm(this.props)}
        rootClose={true}
      >
        {addTrigger}
      </OverlayTrigger>
    );
  }
}

export default ChecklistAdd;

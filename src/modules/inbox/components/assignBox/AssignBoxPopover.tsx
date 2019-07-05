import { __ } from 'modules/common/utils';
import AssignBox from 'modules/inbox/containers/AssignBox';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { IConversation } from '../../types';

type Props = {
  targets: IConversation[];
  trigger: React.ReactNode;
  container?: React.ReactNode;
  afterSave?: () => void;
};

class AssignBoxPopover extends React.Component<Props> {
  private overlayTrigger;

  hidePopover = () => {
    const { afterSave } = this.props;

    if (afterSave) {
      afterSave();
    }

    this.overlayTrigger.hide();
  };

  render() {
    const { targets, trigger, container } = this.props;
    const popover = (
      <Popover id="assign-popover" title={__('Choose person')}>
        <AssignBox
          targets={targets}
          event="onClick"
          afterSave={this.hidePopover}
        />
      </Popover>
    );

    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom"
        overlay={popover}
        container={container}
        rootClose={true}
      >
        {trigger}
      </OverlayTrigger>
    );
  }
}

export default AssignBoxPopover;

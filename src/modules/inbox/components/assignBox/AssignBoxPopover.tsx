import { __ } from 'modules/common/utils';
import { AssignBox } from 'modules/inbox/containers';
import * as React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  targets: PropTypes.arrayOf(Object).isRequired,
  trigger: any;
  container: any;
  afterSave: () => void;
};

class AssignBoxPopover extends React.Component<Props> {
  private overlayTrigger;

  constructor(props) {
    super(props);

    this.hidePopover = this.hidePopover.bind(this);
  }

  hidePopover() {
    const { afterSave } = this.props;

    if (afterSave) {
      afterSave();
    }

    this.overlayTrigger.hide();
  }

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
        rootClose
      >
        {trigger}
      </OverlayTrigger>
    );
  }
}

export default AssignBoxPopover;

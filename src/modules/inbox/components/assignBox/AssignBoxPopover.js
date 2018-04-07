import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { AssignBox } from 'modules/inbox/containers';

const propTypes = {
  targets: PropTypes.arrayOf(Object).isRequired,
  trigger: PropTypes.element.isRequired,
  container: PropTypes.element,
  afterSave: PropTypes.func
};

class AssignBoxPopover extends Component {
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
    const { __ } = this.context;
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

AssignBoxPopover.propTypes = propTypes;
AssignBoxPopover.contextTypes = {
  __: PropTypes.func
};

export default AssignBoxPopover;

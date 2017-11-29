import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { AssignBox } from 'modules/inbox/containers';

const propTypes = {
  targets: PropTypes.arrayOf(Object).isRequired,
  trigger: PropTypes.element.isRequired,
  container: PropTypes.element
};

class AssignBoxPopover extends Component {
  constructor(props) {
    super(props);

    this.hidePopover = this.hidePopover.bind(this);
  }

  hidePopover() {
    this.overlayTrigger.hide();
  }

  render() {
    const { targets, trigger, container } = this.props;
    const popover = (
      <Popover id="assign-popover" title="Choose person">
        <AssignBox
          targets={targets}
          event="onClick"
          hidePopover={this.hidePopover}
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

export default AssignBoxPopover;

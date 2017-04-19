import React, { PropTypes } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { AssignBox } from '../../containers';

const propTypes = {
  targets: PropTypes.arrayOf(PropTypes.string).isRequired,
  trigger: PropTypes.element.isRequired,
  container: PropTypes.element,
  afterSave: PropTypes.func,
};

function AssignBoxPopover({ targets, trigger, container, afterSave }) {
  const popover = (
    <Popover id="assign-popover" title="Choose person">
      <AssignBox targets={targets} event="onClick" afterSave={afterSave} />
    </Popover>
  );

  return (
    <OverlayTrigger
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

AssignBoxPopover.propTypes = propTypes;

export default AssignBoxPopover;

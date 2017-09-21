import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { AssignBox } from '../../containers';

const propTypes = {
  targets: PropTypes.arrayOf(PropTypes.string).isRequired,
  trigger: PropTypes.element.isRequired,
  container: PropTypes.element,
};

function AssignBoxPopover({ targets, trigger, container }) {
  const popover = (
    <Popover id="assign-popover" title="Choose person">
      <AssignBox targets={targets} event="onClick" />
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

import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import AssignBox from '../../containers/AssignBox';

const propTypes = {
  targets: PropTypes.arrayOf(Object).isRequired,
  trigger: PropTypes.element.isRequired,
  afterSave: PropTypes.func,
  container: PropTypes.element
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

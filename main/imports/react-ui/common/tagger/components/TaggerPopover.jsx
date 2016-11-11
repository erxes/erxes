import React, { PropTypes } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Tagger } from '../..';


const propTypes = {
  type: PropTypes.string.isRequired,
  targets: PropTypes.arrayOf(PropTypes.object).isRequired,
  trigger: PropTypes.element.isRequired,
  container: PropTypes.element,
};

function TaggerPopover({ targets, type, trigger, container }) {
  const popover = (
    <Popover id="tags-popover" title="Choose your tags">
      <Tagger
        targets={targets}
        type={type}
        event="onExit"
      />
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

TaggerPopover.propTypes = propTypes;

export default TaggerPopover;

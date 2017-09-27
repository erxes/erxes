import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { Tagger } from '/imports/react-ui/common';

const propTypes = {
  type: PropTypes.string.isRequired,
  targets: PropTypes.arrayOf(Object).isRequired,
  trigger: PropTypes.element.isRequired,
  afterSave: PropTypes.func,
  container: PropTypes.element,
};

function TaggerPopover({ targets, type, trigger, afterSave, container }) {
  const popover = (
    <Popover id="tags-popover" title="Choose your tags">
      <Tagger targets={targets} type={type} event="onExit" afterSave={afterSave} />
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

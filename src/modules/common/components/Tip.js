import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
  placement: PropTypes.string
};

function Tip({ text, children, placement }) {
  const tooltip = <Tooltip id="tooltip">{text}</Tooltip>;
  const placementValue = placement || 'top';
  return (
    <OverlayTrigger
      overlay={tooltip}
      placement={placementValue}
      delayShow={300}
      delayHide={150}
    >
      {children}
    </OverlayTrigger>
  );
}

Tip.propTypes = propTypes;

export default Tip;

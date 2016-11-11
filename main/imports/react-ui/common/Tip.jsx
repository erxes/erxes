import React, { PropTypes } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';


const propTypes = {
  text: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

function Tip({ text, children }) {
  const tooltip = <Tooltip id="tooltip">{text}</Tooltip>;

  return (
    <OverlayTrigger overlay={tooltip} placement="top" delayShow={300} delayHide={150}>
      {children}
    </OverlayTrigger>
  );
}

Tip.propTypes = propTypes;

export default Tip;

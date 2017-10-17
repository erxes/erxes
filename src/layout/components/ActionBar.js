import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  left: PropTypes.node,
  right: PropTypes.node,
};

function ActionBar({ left, right }) {
  return (
    <div className="action-bar">
      <div className="left">{left}</div>
      <div className="right">{right}</div>
    </div>
  );
}

ActionBar.propTypes = propTypes;

export default ActionBar;

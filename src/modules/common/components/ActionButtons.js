import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node.isRequired,
};

function ActionButtons({ children }) {
  return (
    <div className="action-buttons">
      {children}
    </div>
  );
}

ActionButtons.propTypes = propTypes;

export default ActionButtons;

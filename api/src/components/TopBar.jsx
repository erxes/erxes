import React, { PropTypes } from 'react';


const propTypes = {
  middle: PropTypes.node.isRequired,
  buttonClass: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func.isRequired,
};

function TopBar({ middle, buttonClass, onButtonClick }) {
  return (
    <div className="erxes-topbar">
      <div
        className={`topbar-button left ${buttonClass}`}
        onClick={onButtonClick}
      />
      <div className="erxes-title">
        {middle}
      </div>
    </div>
  );
}

TopBar.propTypes = propTypes;

export default TopBar;

import React, { PropTypes } from 'react';


const propTypes = {
  middle: PropTypes.node,
  buttonClass: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  color: PropTypes.string,
};

function TopBar({ middle, buttonClass, onButtonClick, color }) {
  return (
    <div className="erxes-topbar" style={{ backgroundColor: color }}>
      <div
        className={`topbar-button left ${buttonClass}`}
        onClick={onButtonClick}
      />
      <div className="erxes-middle">
        {middle}
      </div>
    </div>
  );
}

TopBar.propTypes = propTypes;

TopBar.defaultProps = {
  middle: null,
  color: null,
};

export default TopBar;

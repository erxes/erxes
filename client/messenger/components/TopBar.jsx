import React, { PropTypes } from 'react';


const propTypes = {
  middle: PropTypes.node,
  buttonClass: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  color: PropTypes.string,
  endConversation: PropTypes.func,
};

function TopBar({ middle, buttonClass, onButtonClick, color, endConversation }) {
  const onEndConversation = () => {
    if (confirm('Do you want to end this conversation ?')) {
      endConversation();
    }
  };

  return (
    <div className="erxes-topbar" style={{ backgroundColor: color }}>
      <div
        className={`topbar-button left ${buttonClass}`}
        onClick={onButtonClick}
      />
      <div className="erxes-middle">
        {middle}
      </div>

      <div className={`topbar-button right`} onClick={onEndConversation}>
        o
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

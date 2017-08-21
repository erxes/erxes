import React, { PropTypes } from 'react';
import Ionicon from 'react-ionicons';

const propTypes = {
  middle: PropTypes.node,
  buttonIcon: PropTypes.node.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  color: PropTypes.string,
  endConversation: PropTypes.func,
  isChat: PropTypes.bool,
  isConversationEnded: PropTypes.bool,
};

function TopBar({ middle, buttonIcon, onButtonClick, color, isChat, isConversationEnded, endConversation }) {
  const onEndConversation = () => {
    if (confirm('Do you want to end this conversation ?')) {
      endConversation();
    }
  };

  const renderEndConversation = () => {
    if (isChat && !isConversationEnded) {
      return (
        <div className="topbar-button right close" onClick={onEndConversation} />
      );
    }

    return null;
  };

  return (
    <div className="erxes-topbar" style={{ backgroundColor: color }}>
      <div className='topbar-button left' onClick={onButtonClick} >
        {buttonIcon}
      </div>
      <div className="erxes-middle">
        {middle}
      </div>

      {renderEndConversation()}
    </div>
  );
}

TopBar.propTypes = propTypes;

TopBar.defaultProps = {
  middle: null,
  color: null,
};

export default TopBar;

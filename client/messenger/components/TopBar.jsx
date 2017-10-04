import React, { PropTypes } from 'react';
import { iconExit } from '../../icons/Icons';

const propTypes = {
  middle: PropTypes.node,
  onButtonClick: PropTypes.func,
  buttonIcon: PropTypes.node,
  color: PropTypes.string,
  endConversation: PropTypes.func,
  isChat: PropTypes.bool,
  isConversationEnded: PropTypes.bool,
};

function TopBar({
    middle,
    buttonIcon,
    onButtonClick,
    color,
    isChat,
    isConversationEnded,
    endConversation,
  }) {

  const onEndConversation = () => {
    if (confirm('Do you want to end this conversation ?')) {
      endConversation();
    }
  };

  const renderEndConversation = () => {
    if (isChat && !isConversationEnded) {
      return (
        <a
          href="#"
          className="topbar-button right"
          onClick={onEndConversation}
          title="End conversation"
        >
          {iconExit}
        </a>
      );
    }

    return null;
  };

  return (
    <div className="erxes-topbar" style={{ backgroundColor: color }}>
      <a href="" className="topbar-button left" onClick={onButtonClick} >
        {buttonIcon}
      </a>
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

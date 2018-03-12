import React from 'react';
import PropTypes from 'prop-types';
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

const contextTypes = {
  __: PropTypes.func
};

function TopBar({
    middle,
    buttonIcon,
    onButtonClick,
    color,
    isChat,
    isConversationEnded,
    endConversation,
  }, {__}) {

  const onEndConversation = () => {
    if (confirm(__('Do you want to end this conversation ?'))) {
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

  const renderLeftButton = () => {
    if (onButtonClick) {
      return (
        <a
          href="#"
          className="topbar-button left"
          onClick={onButtonClick}
        >
          {buttonIcon}
        </a>
      );
    }

    return null;
  };

  return (
    <div className="erxes-topbar" style={{ backgroundColor: color }}>
      {renderLeftButton()}
      <div className="erxes-middle">
        {middle}
      </div>
      {renderEndConversation()}
    </div>
  );
}

TopBar.propTypes = propTypes;
TopBar.contextTypes = contextTypes;

TopBar.defaultProps = {
  middle: null,
  color: null,
};

export default TopBar;

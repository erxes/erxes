import * as React from 'react';
import * as classNames from 'classnames';
import { iconExit } from '../../icons/Icons';
import { __ } from '../../utils';

type Props = {
  middle: React.ReactNode,
  buttonIcon?: React.ReactNode,
  isChat: boolean,
  color?: string,
  isExpanded?: boolean,
  onButtonClick?: (e: React.FormEvent<HTMLButtonElement>) => void,
  onToggle?: () => void,
  endConversation: () => void,
};

function TopBar({
    middle,
    buttonIcon,
    onButtonClick,
    color,
    isChat,
    endConversation,
    isExpanded,
    onToggle,
  }: Props) {

  const topBarClassNames = classNames('erxes-topbar', {
    'expanded': isExpanded
  });

  const onEndConversation = () => {
    if (confirm((__('Do you want to end this conversation ?') || {}).toString())) {
      endConversation();
    }
  };

  const renderEndConversation = () => {
    if (isChat) {
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
        <button
          className="topbar-button left"
          onClick={onButtonClick}
        >
          {buttonIcon}
        </button>
      );
    }

    return null;
  };

  return (
    <div onClick={onToggle} className={topBarClassNames} style={{ backgroundColor: color }}>
      {renderLeftButton()}
      <div className="erxes-middle">
        {middle}
      </div>
      {renderEndConversation()}
    </div>
  );
}

export default TopBar;

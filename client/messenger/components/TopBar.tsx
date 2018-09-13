import * as classNames from "classnames";
import * as React from "react";
import { iconClose } from "../../icons/Icons";
import { __ } from "../../utils";

type Props = {
  middle: React.ReactNode;
  buttonIcon?: React.ReactNode;
  isChat: boolean;
  color?: string;
  isExpanded?: boolean;
  isBig: boolean;
  onButtonClick?: (e: React.FormEvent<HTMLButtonElement>) => void;
  onToggle?: () => void;
  toggleLauncher: () => void;
  endConversation: () => void;
};

function TopBar({
  middle,
  buttonIcon,
  onButtonClick,
  color,
  isChat,
  endConversation,
  isExpanded,
  isBig,
  onToggle,
  toggleLauncher
}: Props) {
  const topBarClassNames = classNames("erxes-topbar", {
    expanded: isExpanded,
    big: isBig
  });

  const middleClass = classNames("erxes-middle", {
    expandable: onToggle ? true : false
  });

  const onEndConversation = () => {
    if (
      isChat &&
      confirm((__("Do you want to end this conversation ?") || {}).toString())
    ) {
      endConversation();
    } else {
      toggleLauncher();
    }
  };

  const renderRightButton = () => {
    return (
      <a
        href="#"
        className="topbar-button right"
        onClick={isChat ? onEndConversation : toggleLauncher}
        title="End conversation"
      >
        {iconClose}
      </a>
    );
  };

  const renderLeftButton = () => {
    if (!onButtonClick) {
      return null;
    }

    return (
      <button className="topbar-button left" onClick={onButtonClick}>
        {buttonIcon}
      </button>
    );
  };

  return (
    <div className={topBarClassNames} style={{ backgroundColor: color }}>
      {renderLeftButton()}
      <div onClick={onToggle} className={middleClass}>
        {middle}
      </div>
      {renderRightButton()}
    </div>
  );
}

export default TopBar;

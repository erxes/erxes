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

class TopBar extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.onEndConversation = this.onEndConversation.bind(this);
  }

  onEndConversation() {
    const { isChat, toggleLauncher, endConversation } = this.props;

    if (
      isChat &&
      confirm((__("Do you want to end this conversation ?") || {}).toString())
    ) {
      endConversation();
    } else {
      toggleLauncher();
    }
  }

  renderRightButton() {
    const { isChat, toggleLauncher } = this.props;

    return (
      <a
        href="#"
        className="topbar-button right"
        onClick={isChat ? this.onEndConversation : toggleLauncher}
        title="End conversation"
      >
        {iconClose}
      </a>
    );
  }

  renderLeftButton() {
    const { onButtonClick } = this.props;

    if (!onButtonClick) {
      return null;
    }

    return (
      <button className="topbar-button left" onClick={onButtonClick}>
        {this.props.buttonIcon}
      </button>
    );
  }

  render() {
    const { middle, color, isExpanded, isBig, onToggle } = this.props;

    const topBarClassNames = classNames("erxes-topbar", {
      expanded: isExpanded,
      big: isBig
    });

    const middleClass = classNames("erxes-middle", {
      expandable: onToggle ? true : false
    });

    return (
      <div className={topBarClassNames} style={{ backgroundColor: color }}>
        {this.renderLeftButton()}
        <div onClick={onToggle} className={middleClass}>
          {middle}
        </div>
        {this.renderRightButton()}
      </div>
    );
  }
}
export default TopBar;

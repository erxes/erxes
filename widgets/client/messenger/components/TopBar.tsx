import * as classNames from "classnames";
import * as React from "react";
import { iconClose, iconLeft, iconMore } from "../../icons/Icons";
import { __ } from "../../utils";

type Props = {
  middle: React.ReactNode;
  isChat: boolean;
  color?: string;
  textColor?: string;
  isExpanded?: boolean;
  prevHeight?: number;
  toggleHead?: () => void;
  toggleLauncher: (isMessengerVisible?: boolean) => void;
  endConversation: () => void;
  setHeadHeight: (height: number) => void;
  onLeftButtonClick?: (e: React.FormEvent<HTMLButtonElement>) => void;
};

type State = {
  headHeight: any;
  isVisibleDropdown: boolean;
};

class TopBar extends React.Component<Props, State> {
  private node: HTMLDivElement | null = null;
  constructor(props: Props) {
    super(props);

    this.state = { headHeight: props.prevHeight, isVisibleDropdown: false };
    this.endConversation = this.endConversation.bind(this);
  }

  updateHeight() {
    if (this.node && this.state.headHeight !== this.node.clientHeight) {
      const headHeight = this.node.clientHeight;
      this.setState({ headHeight });
      this.props.setHeadHeight(headHeight);
    }
  }

  componentDidUpdate() {
    this.updateHeight();
  }

  componentDidMount() {
    this.updateHeight();
  }

  toggleDropdown = () => {
    this.setState({ isVisibleDropdown: !this.state.isVisibleDropdown });
  };

  endConversation() {
    const { endConversation } = this.props;

    if (
      confirm((__("Do you want to end this conversation ?") || {}).toString())
    ) {
      endConversation();
    }
  }

  toggleLauncher = () => {
    this.props.toggleLauncher(true);
  };

  renderRightButton() {
    const topBarClassNames = classNames("topbar-button", "right", "fade-in", {
      "dropdown-open": this.state.isVisibleDropdown
    });

    if (!this.props.isChat) {
      return (
        <a
          className={topBarClassNames}
          onClick={this.toggleLauncher}
          title="Close"
        >
          {iconClose(this.props.textColor)}
        </a>
      );
    }

    return (
      <button className={topBarClassNames} onClick={this.toggleDropdown}>
        {iconMore(this.props.textColor)}
        <ul>
          <li>
            <a href="#" onClick={this.endConversation}>
              {__("End conversation")}
            </a>
          </li>
          <li>
            <a href="#" onClick={this.toggleLauncher}>
              {__("Close")}
            </a>
          </li>
        </ul>
      </button>
    );
  }

  renderLeftButton() {
    const { onLeftButtonClick, textColor } = this.props;

    if (!onLeftButtonClick) {
      return null;
    }

    return (
      <button
        className="topbar-button left fade-in"
        onClick={onLeftButtonClick}
      >
        {iconLeft(textColor)}
      </button>
    );
  }

  render() {
    const { color, isExpanded, middle, toggleHead, textColor } = this.props;

    const topBarClassNames = classNames("erxes-topbar", {
      expanded: isExpanded
    });

    const middleClass = classNames("erxes-middle", "fade-in", {
      expandable: toggleHead ? true : false
    });

    return (
      <div
        className="head-wrapper"
        style={{ height: this.state.headHeight, backgroundColor: color }}
      >
        <div
          className={topBarClassNames}
          style={{ color: textColor }}
          ref={node => {
            this.node = node;
          }}
        >
          {this.renderLeftButton()}
          <div onClick={toggleHead} className={middleClass}>
            {middle}
          </div>
          {this.renderRightButton()}
        </div>
      </div>
    );
  }
}
export default TopBar;

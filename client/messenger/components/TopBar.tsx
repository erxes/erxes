import * as classNames from "classnames";
import * as React from "react";
import { iconClose, iconLeft } from "../../icons/Icons";
import { __ } from "../../utils";

type Props = {
  middle: React.ReactNode;
  isChat: boolean;
  color?: string;
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
};

class TopBar extends React.Component<Props, State> {
  private node: HTMLDivElement | null = null;
  constructor(props: Props) {
    super(props);

    this.state = { headHeight: props.prevHeight };
    this.onRightButtonClick = this.onRightButtonClick.bind(this);
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

  onRightButtonClick() {
    const { isChat, toggleLauncher, endConversation } = this.props;

    if (
      isChat &&
      confirm((__("Do you want to end this conversation ?") || {}).toString())
    ) {
      return endConversation();
    }

    toggleLauncher(true);
  }

  renderRightButton() {
    return (
      <a
        href="#"
        className="topbar-button right fade-in"
        onClick={this.onRightButtonClick}
        title="End conversation"
      >
        {iconClose}
      </a>
    );
  }

  renderLeftButton() {
    const { onLeftButtonClick } = this.props;

    if (!onLeftButtonClick) {
      return null;
    }

    return (
      <button
        className="topbar-button left fade-in"
        onClick={onLeftButtonClick}
      >
        {iconLeft}
      </button>
    );
  }

  render() {
    const { color, isExpanded, isChat, middle, toggleHead } = this.props;

    const topBarClassNames = classNames("erxes-topbar", {
      expanded: isExpanded,
      "end-chat": isChat
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

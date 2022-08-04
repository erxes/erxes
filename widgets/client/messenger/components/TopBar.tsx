import * as classNames from "classnames";
import * as React from "react";
import * as ReactModal from "react-modal";
import { iconClose, iconLeft, iconMore } from "../../icons/Icons";
import { __, readFile} from "../../utils";

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
  exportConversation: (callback: (exportData: any) => void) => void;
  setHeadHeight: (height: number) => void;
  onLeftButtonClick?: (e: React.FormEvent<HTMLButtonElement>) => void;
  activeConversation?: string | null;
};

type State = {
  headHeight: any;
  isVisibleDropdown: boolean;
  isModalOpen: boolean;
};
class TopBar extends React.Component<Props, State> {
  private node: HTMLDivElement | null = null;
  constructor(props: Props) {
    super(props);

    this.state = { 
      headHeight: props.prevHeight, 
      isVisibleDropdown: false,
      isModalOpen: false
    };
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

  toggleModal = () => {
    this.setState({ isModalOpen: !this.state.isModalOpen });
  };

  toggleDropdown = () => {
    this.setState({ isVisibleDropdown: !this.state.isVisibleDropdown });
  };

  endConversation = (_e: any, confirmed?: boolean) => {
    const { endConversation } = this.props;

    if (!confirmed) {
      return this.toggleModal();
    }

    return endConversation();
  };

  toggleLauncher = () => {
    this.props.toggleLauncher(true);
  };

  exportConversation = () => {
    const { exportConversation } = this.props;
    exportConversation(exportData => {
      // exported data in new tab.
      const url = readFile(exportData);
      window.open( url, '_blank')?.focus();
    });
  }

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
            <a href="#" onClick={this.toggleModal}>
              {__("End conversation")}
            </a>
          </li>
          <li>
            <a href="#" onClick={this.toggleLauncher}>
              {__("Close")}
            </a>
          </li>
          { this.props.activeConversation &&
          <li>
            <a href="#" onClick={this.exportConversation}>
              {__("Export conversation")}
            </a>
          </li>
          }
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

  renderModal() {
    const { isModalOpen } = this.state;

    const handleConfirm = (e: any) => this.endConversation(e, true);

    return (
      <ReactModal
        isOpen={isModalOpen}
        onRequestClose={this.toggleModal}
        ariaHideApp={false}
        className="erxes-modal fade-in"
        overlayClassName="erxes-overlay"
      >
        <h5>{__("Do you want to end this conversation ?")}</h5>
        <div className="modal-footer">
          <button className="erxes-button btn-outline" onClick={this.endConversation}>{__("No")}</button>
          <button className="erxes-button btn-primary" onClick={handleConfirm}>{__("Yes")}</button>
        </div>
      </ReactModal>
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
      <>
        {this.renderModal()}
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
      </>
    );
  }
}
export default TopBar;

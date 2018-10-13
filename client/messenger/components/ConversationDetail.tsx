import * as React from "react";
import * as ReactTransitionGroup from "react-transition-group";
import { Profile, Supporters } from ".";
import { iconLeft } from "../../icons/Icons";
import { IParticipator, IUser } from "../../types";
import { __ } from "../../utils";
import { BrandInfo, MessageSender, MessagesList, TopBar } from "../containers";
import { IMessage } from "../types";

type Props = {
  messages: IMessage[];
  goToConversationList: () => void;
  supporters: IUser[];
  participators: IParticipator[];
  isOnline: boolean;
  color?: string;
  loading?: boolean;
};

type State = {
  isFocused: boolean;
  expanded: boolean;
  isFullHead: boolean;
};

class ConversationDetail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isFocused: false, expanded: true, isFullHead: true };

    this.inputFocus = this.inputFocus.bind(this);
    this.onTextInputBlur = this.onTextInputBlur.bind(this);
    this.toggle = this.toggle.bind(this);
    this.onWheel = this.onWheel.bind(this);
  }

  transitionElement(children: any, visible: boolean) {
    return (
      <ReactTransitionGroup.CSSTransition
        in={visible}
        timeout={300}
        classNames="fade-slide"
        unmountOnExit
        onExit={() => {
          this.setState({
            expanded: !this.state.expanded
          });
        }}
      >
        {children}
      </ReactTransitionGroup.CSSTransition>
    );
  }

  toggle() {
    this.setState({ isFullHead: !this.state.isFullHead });
  }

  inputFocus() {
    this.setState({ isFocused: true, isFullHead: false });
  }

  onTextInputBlur() {
    this.setState({ isFocused: false });
  }

  onWheel(e: any) {
    if (e.nativeEvent.wheelDelta > 0) {
      if (!this.state.isFullHead) {
        this.setState({ isFullHead: true });
      }
    } else {
      if (this.state.isFullHead) {
        this.setState({ isFullHead: false });
      }
    }
  }

  renderProfile() {
    const { participators, isOnline } = this.props;

    const profileComponent = (expanded: boolean) => {
      return (
        <Profile
          user={participators[0]}
          isOnline={isOnline}
          isExpanded={expanded}
        />
      );
    };

    return (
      <React.Fragment>
        {this.transitionElement(
          <div className="erxes-head-content">{profileComponent(true)}</div>,
          this.state.isFullHead
        )}

        {this.transitionElement(
          <div className="erxes-small-head">{profileComponent(false)}</div>,
          !this.state.isFullHead
        )}
      </React.Fragment>
    );
  }

  renderHead() {
    const { supporters, isOnline, color, loading } = this.props;
    const supportersComponent = (expanded: boolean) => {
      return (
        <Supporters
          users={supporters}
          loading={loading}
          isOnline={isOnline}
          color={color}
          isExpanded={expanded}
        />
      );
    };

    return (
      <React.Fragment>
        {this.transitionElement(
          <div className="erxes-head-content">
            <BrandInfo />
            {supportersComponent(true)}
          </div>,
          this.state.isFullHead
        )}

        {this.transitionElement(
          <div className="erxes-small-head">{supportersComponent(false)}</div>,
          !this.state.isFullHead
        )}
      </React.Fragment>
    );
  }

  render() {
    const {
      messages,
      participators,
      goToConversationList,
      isOnline
    } = this.props;

    const placeholder = !messages.length
      ? __("Send a message")
      : __("Write a reply");

    return (
      <div className="erxes-conversation-detail" onWheel={this.onWheel}>
        <TopBar
          middle={
            participators.length ? this.renderProfile() : this.renderHead()
          }
          buttonIcon={iconLeft}
          toggleHead={this.toggle}
          isExpanded={this.state.expanded}
          onLeftButtonClick={(e: React.FormEvent<HTMLButtonElement>) => {
            e.preventDefault();
            goToConversationList();
          }}
        />

        <MessagesList
          isOnline={isOnline}
          messages={messages}
          inputFocus={this.inputFocus}
        />

        <MessageSender
          placeholder={placeholder ? placeholder.toString() : ""}
          isParentFocused={this.state.isFocused}
          onTextInputBlur={this.onTextInputBlur}
          collapseHead={this.inputFocus}
        />
      </div>
    );
  }
}

export default ConversationDetail;

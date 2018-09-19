import * as React from "react";
import { defaultAvatar, iconLeft } from "../../icons/Icons";
import { IUser } from "../../types";
import { __ } from "../../utils";
import { BrandInfo, MessageSender, MessagesList, TopBar } from "../containers";
import { IMessage } from "../types";
import { Supporters } from "./";

type Props = {
  messages: IMessage[];
  goToConversationList: () => void;
  supporters: IUser[];
  isOnline: boolean;
  color?: string;
  isNew?: boolean;
  loading?: boolean;
};

type State = {
  isFocused: boolean;
  expanded: boolean;
};

class Conversation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isFocused: false, expanded: true };

    this.inputFocus = this.inputFocus.bind(this);
    this.onTextInputBlur = this.onTextInputBlur.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const { supporters } = this.props;

    if (supporters.length !== 0) {
      this.setState({ expanded: !this.state.expanded });
    }
  }

  inputFocus() {
    this.setState({ isFocused: true, expanded: false });
  }

  onTextInputBlur() {
    this.setState({ isFocused: false });
  }

  renderHead() {
    const { supporters, isOnline, color, loading } = this.props;

    const supportersContent = (
      <Supporters
        users={supporters}
        loading={loading}
        isOnline={isOnline}
        color={color}
        isExpanded={this.state.expanded}
      />
    );

    if (supporters.length === 0) {
      return supportersContent;
    }

    return (
      <div className="erxes-head-content">
        <BrandInfo />
        {supportersContent}
      </div>
    );
  }

  render() {
    const { messages, isNew, goToConversationList, isOnline } = this.props;

    const placeholder = isNew ? __("Send a message") : __("Write a reply");

    return (
      <React.Fragment>
        <TopBar
          middle={this.renderHead()}
          buttonIcon={iconLeft}
          onToggle={this.toggle}
          isBig={false}
          isExpanded={this.state.expanded}
          onButtonClick={(e: React.FormEvent<HTMLButtonElement>) => {
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
      </React.Fragment>
    );
  }
}

export default Conversation;

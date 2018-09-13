import * as React from "react";
import { defaultAvatar, iconLeft } from "../../icons/Icons";
import { IUser } from "../../types";
import { __ } from "../../utils";
import { MessageSender, MessagesList, TopBar } from "../containers";
import { IMessage } from "../types";
import { Supporters } from "./";

type Props = {
  messages: IMessage[];
  goToConversationList: () => void;
  users: IUser[];
  isOnline: boolean;
  color?: string;
  isNew?: boolean;
};

type State = {
  isFocused: boolean;
  expanded: boolean;
};

class Conversation extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isFocused: false, expanded: false };

    this.inputFocus = this.inputFocus.bind(this);
    this.onTextInputBlur = this.onTextInputBlur.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    const { users } = this.props;

    if (users.length !== 0) {
      this.setState({ expanded: !this.state.expanded });
    }
  }

  inputFocus() {
    this.setState({ isFocused: true });
  }

  onTextInputBlur() {
    this.setState({ isFocused: false });
  }

  render() {
    const {
      messages,
      isNew,
      goToConversationList,
      isOnline,
      users,
      color
    } = this.props;

    const placeholder = isNew ? __("Send a message") : __("Write a reply");

    return (
      <React.Fragment>
        <TopBar
          middle={
            <Supporters
              users={users}
              isOnline={isOnline}
              color={color}
              isExpanded={this.state.expanded}
            />
          }
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
        />
      </React.Fragment>
    );
  }
}

export default Conversation;

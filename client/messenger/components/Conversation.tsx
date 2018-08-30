import * as React from "react";
import { defaultAvatar, iconLeft } from "../../icons/Icons";
import { IUser } from "../../types";
import { __ } from "../../utils";
import { MessageSender, MessagesList, TopBar } from "../containers";
import { IMessage } from "../types";

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

  renderUserInfo(user: IUser, type: string | React.ReactNode) {
    const { color } = this.props;
    const details = user.details || { avatar: defaultAvatar, fullName: "" };
    const avatar = details.avatar;

    if (type === "avatar") {
      return (
        <img
          key={user._id}
          style={{ borderColor: color }}
          src={avatar}
          alt={details.fullName}
        />
      );
    }

    if (type === "name") {
      return <span key={user._id}>{details.fullName} </span>;
    }

    return (
      <div key={user._id} className="erxes-staff-profile">
        <img src={avatar} alt={details.fullName} />
        <div className="erxes-staff-name">{details.fullName}</div>
        {type}
      </div>
    );
  }

  renderTitle() {
    const { users, isOnline } = this.props;

    if (users.length !== 0) {
      const state = (
        <div className="erxes-staff-company">
          {isOnline ? (
            <div className="erxes-state online">
              <span /> {__("Online")}
            </div>
          ) : (
            <div className="erxes-state offline">
              <span /> {__("Offline")}
            </div>
          )}
        </div>
      );

      const avatars = users.map(user => this.renderUserInfo(user, "avatar"));
      const names = users.map(user => this.renderUserInfo(user, "name"));
      const supporters = users.map(user => this.renderUserInfo(user, state));

      return (
        <div>
          <div className="erxes-avatars">
            <div className="erxes-avatars-wrapper">{avatars}</div>
            <div className="erxers-names-wrapper">{names}</div>
            {state}
          </div>
          <div className="erxes-staffs">{supporters}</div>
        </div>
      );
    }

    return (
      <div className="erxes-topbar-title">
        <div>{__("Conversation")}</div>
        <span>{__("with Support staff")}</span>
      </div>
    );
  }

  render() {
    const { messages, isNew, goToConversationList, isOnline } = this.props;

    const placeholder = isNew ? __("Send a message") : __("Write a reply");

    return (
      <React.Fragment>
        <TopBar
          middle={this.renderTitle()}
          buttonIcon={iconLeft}
          onToggle={this.toggle}
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

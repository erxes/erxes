import * as React from "react";
import { IParticipator, IUser } from "../../types";
import { __ } from "../../utils";
import { MessageSender, MessagesList, TopBar } from "../containers";
import { IMessage } from "../types";
import ConversatioHeadContent from "./ConversatioHeadContent";

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

    this.state = { isFocused: true, expanded: true, isFullHead: true };

    this.inputFocus = this.inputFocus.bind(this);
    this.onTextInputBlur = this.onTextInputBlur.bind(this);
    this.toggleHead = this.toggleHead.bind(this);
    this.toggleExpand = this.toggleExpand.bind(this);
    this.onWheel = this.onWheel.bind(this);
  }

  toggleHead() {
    this.setState({ isFullHead: !this.state.isFullHead });
  }

  toggleExpand() {
    this.setState({ expanded: !this.state.expanded });
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

  render() {
    const {
      messages,
      participators,
      supporters,
      goToConversationList,
      isOnline,
      color,
      loading
    } = this.props;

    const placeholder = !messages.length
      ? __("Send a message")
      : __("Write a reply");

    return (
      <div className="erxes-conversation-detail" onWheel={this.onWheel}>
        <TopBar
          middle={
            <ConversatioHeadContent
              supporters={supporters}
              participators={participators}
              isOnline={isOnline}
              color={color}
              loading={loading}
              expanded={this.state.isFullHead}
              toggleExpand={this.toggleExpand}
            />
          }
          toggleHead={this.toggleHead}
          isExpanded={this.state.expanded}
          onLeftButtonClick={(e: React.FormEvent<HTMLButtonElement>) => {
            e.preventDefault();
            goToConversationList();
          }}
        />

        <MessagesList
          isOnline={isOnline}
          messages={messages}
          color={color}
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

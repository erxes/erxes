import * as classNames from "classnames";
import * as React from "react";
import * as RTG from "react-transition-group";
import { setLocalStorageItem } from "../../common";
import { iconCall, iconVideo } from "../../icons/Icons";
import {
  IIntegrationMessengerData,
  IIntegrationMessengerDataMessagesItem,
  IIntegrationUiOptions
} from "../../types";
import { makeClickableLink, scrollTo } from "../../utils";
import { MESSAGE_TYPES } from "../containers/AppContext";
import { IMessage } from "../types";
import { Message } from "./";
import AccquireInformation from "./AccquireInformation";

type Props = {
  messages: IMessage[];
  isOnline: boolean;
  color?: string;
  inputFocus: () => void;
  uiOptions: IIntegrationUiOptions;
  messengerData: IIntegrationMessengerData;
  saveGetNotified: (
    doc: { type: string; value: string },
    callback?: () => void
  ) => void;
  isLoggedIn: () => boolean;
  getColor?: string;
  toggleVideoCall: () => void;
  sendMessage: (contentType: string, message: string) => void;
  showVideoCallRequest: boolean;
};

type State = {
  hideNotifyInput: boolean;
};

class MessagesList extends React.Component<Props, State> {
  private node: HTMLDivElement | null = null;
  private shouldScrollBottom: boolean = false;

  constructor(props: Props) {
    super(props);

    this.state = { hideNotifyInput: false };
    this.onNotify = this.onNotify.bind(this);
  }

  componentDidMount() {
    if (this.node) {
      this.node.scrollTop = this.node.scrollHeight;
      makeClickableLink("#erxes-messages a");
    }
  }

  componentWillUpdate() {
    const node = this.node;

    if (node) {
      this.shouldScrollBottom =
        node.scrollHeight - (node.scrollTop + node.offsetHeight) < 20;
    }
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.messages !== this.props.messages) {
      if (this.node && this.shouldScrollBottom) {
        scrollTo(this.node, this.node.scrollHeight, 500);
      }
      makeClickableLink("#erxes-messages a");
    }
  }

  onNotify = ({ type, value }: { type: string; value: string }) => {
    this.props.saveGetNotified({ type, value }, () => {
      this.setState({ hideNotifyInput: true }, () =>
        setLocalStorageItem("hasNotified", "true")
      );
    });
  };

  renderAwayMessage(messengerData: IIntegrationMessengerData) {
    const { isOnline } = this.props;
    const messages =
      messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

    if (isOnline || !messages.away) {
      return null;
    }

    return <li className="erxes-spacial-message away">{messages.away}</li>;
  }

  renderNotifyInput(messengerData: IIntegrationMessengerData) {
    const { isLoggedIn, getColor } = this.props;

    if (isLoggedIn()) {
      return null;
    }

    if (this.state.hideNotifyInput) {
      const messages =
        messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

      return (
        <li className="erxes-spacial-message">
          <span> {messages.thank || "Thank you. "}</span>
        </li>
      );
    }

    return (
      <li className="erxes-spacial-message auth">
        <AccquireInformation
          save={this.onNotify}
          color={getColor}
          loading={false}
        />
      </li>
    );
  }

  renderWelcomeMessage(messengerData: IIntegrationMessengerData) {
    const { isOnline } = this.props;
    const messages =
      messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

    if (!isOnline || !messages.welcome) {
      return null;
    }

    return <li className="erxes-spacial-message">{messages.welcome}</li>;
  }

  renderCallRequest() {
    if (!this.props.showVideoCallRequest) {
      return null;
    }

    const sendCallRequest = () => {
      this.props.sendMessage(MESSAGE_TYPES.VIDEO_CALL_REQUEST, "");
    };

    const { uiOptions } = this.props;
    const { color, textColor = '#fff' } = uiOptions;

    return (
      <div
        className="app-message-box call-request"
        style={{ borderColor: color }}
      >
        <h5>Audio and video call</h5>
        <p>You can contact the operator by voice or video!</p>
        <div className="call-buttons">
          <button
            className="erxes-button"
            style={{ background: color }}
            onClick={sendCallRequest}
          >
            {iconCall({ color: textColor })}
            <span style={{ background: color, color: textColor }}>Audio call</span>
          </button>
          <button
            className="erxes-button"
            style={{ background: color }}
            onClick={sendCallRequest}
          >
            {iconVideo({ color: textColor })}
            <span style={{ color: textColor }}>Video call</span>
          </button>
        </div>
      </div>
    );
  }

  render() {
    const { uiOptions, messengerData, messages, } = this.props;
    const { color, wallpaper, textColor = '#fff' } = uiOptions;
    const backgroundClass = classNames("erxes-messages-background", {
      [`bg-${wallpaper}`]: wallpaper
    });

    return (
      <div className={backgroundClass} ref={node => (this.node = node)}>
        <ul id="erxes-messages" className="erxes-messages-list slide-in">
          {this.renderWelcomeMessage(messengerData)}
          {this.renderCallRequest()}
          <RTG.TransitionGroup component={null}>
            {messages.map(message => {
              const _id: any = message._id;

              if (_id < 0) {
                return (
                  <RTG.CSSTransition
                    key={message._id}
                    timeout={500}
                    classNames="slide-in"
                  >
                    <Message
                      toggleVideo={this.props.toggleVideoCall}
                      color={color}
                      textColor={textColor}
                      {...message}
                    />
                  </RTG.CSSTransition>
                );
              } else {
                return (
                  <Message
                    key={message._id}
                    toggleVideo={this.props.toggleVideoCall}
                    color={color}
                    textColor={textColor}
                    {...message}
                  />
                );
              }
            })}
          </RTG.TransitionGroup>
          {this.renderAwayMessage(messengerData)}
          {this.renderNotifyInput(messengerData)}
        </ul>
      </div>
    );
  }
}

export default MessagesList;

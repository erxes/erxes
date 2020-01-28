import * as classNames from "classnames";
import * as React from "react";
import * as RTG from "react-transition-group";
import {
  IIntegrationMessengerData,
  IIntegrationMessengerDataMessagesItem,
  IIntegrationUiOptions
} from "../../types";
import { makeClickableLink, scrollTo } from "../../utils";
import { setLocalStorageItem } from "../connection";
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

  render() {
    const { uiOptions, messengerData, messages } = this.props;
    const { color, wallpaper } = uiOptions;
    const backgroundClass = classNames("erxes-messages-background", {
      [`bg-${wallpaper}`]: wallpaper
    });

    return (
      <div className={backgroundClass} ref={node => (this.node = node)}>
        <ul id="erxes-messages" className="erxes-messages-list slide-in">
          {this.renderWelcomeMessage(messengerData)}

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
                    <Message color={color} {...message} />
                  </RTG.CSSTransition>
                );
              } else {
                return <Message key={message._id} color={color} {...message} />;
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

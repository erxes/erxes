import * as classNames from "classnames";
import * as React from "react";
import * as ReactTransitionGroup from "react-transition-group";
import {
  IIntegrationMessengerData,
  IIntegrationMessengerDataMessagesItem,
  IIntegrationUiOptions
} from "../../types";
import { scrollTo } from "../../utils";
import { IMessage } from "../types";
import { Message } from "./";

type Props = {
  messages: IMessage[];
  isOnline: boolean;
  inputFocus: () => void;
  uiOptions: IIntegrationUiOptions;
  messengerData: IIntegrationMessengerData;
};

class MessagesList extends React.Component<Props> {
  private node: HTMLDivElement | null = null;
  private shouldScrollBottom: boolean = false;

  componentDidMount() {
    if (this.node) {
      this.node.scrollTop = this.node.scrollHeight;
      this.makeClickableLink();
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
      this.makeClickableLink();
    }
  }

  makeClickableLink() {
    const nodes = Array.from(document.querySelectorAll("#erxes-messages a"));

    nodes.forEach(node => {
      node.setAttribute("target", "__blank");
    });
  }

  renderAwayMessage(messengerData: IIntegrationMessengerData) {
    const { isOnline } = this.props;
    const messages =
      messengerData.messages || ({} as IIntegrationMessengerDataMessagesItem);

    if (isOnline || !messages.away) {
      return null;
    }

    return <li className="erxes-spacial-message away">{messages.away}</li>;
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
    const { uiOptions, messengerData, messages, inputFocus } = this.props;
    const { color, wallpaper } = uiOptions;
    const backgroundClass = classNames("erxes-messages-background", {
      [`bg-${wallpaper}`]: wallpaper
    });

    return (
      <div
        className={backgroundClass}
        ref={node => (this.node = node)}
        onClick={inputFocus}
      >
        <ul id="erxes-messages" className="erxes-messages-list slide-in">
          {this.renderWelcomeMessage(messengerData)}
          <ReactTransitionGroup.TransitionGroup component={null}>
            {messages.map(message => (
              <ReactTransitionGroup.CSSTransition
                key={message._id}
                timeout={500}
                classNames="slide-in"
              >
                <Message color={color} {...message} />
              </ReactTransitionGroup.CSSTransition>
            ))}
          </ReactTransitionGroup.TransitionGroup>
          {this.renderAwayMessage(messengerData)}
        </ul>
      </div>
    );
  }
}

export default MessagesList;

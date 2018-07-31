import * as classNames from 'classnames';
import * as React from 'react';
import { IIntegrationMessengerData, IIntegrationUiOptions } from '../../types';
import { IMessage } from '../types';
import { Message } from './';

type Props = {
  messages: IMessage[],
  isOnline: boolean,
  uiOptions: IIntegrationUiOptions,
  messengerData: IIntegrationMessengerData,
}

class MessagesList extends React.Component<Props> {
  private node: HTMLUListElement | null = null;
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
      this.shouldScrollBottom = node.scrollHeight - (node.scrollTop + node.offsetHeight) < 30;
    }
  }

  componentDidUpdate() {
    if (this.node && this.shouldScrollBottom) {
      this.node.scrollTop = this.node.scrollHeight;
    }

    this.makeClickableLink();
  }

  makeClickableLink() {
    const links = document.querySelectorAll('#erxes-messages a');

    for (let i=0; i< links.length; i++) {
      const node = links[i];

      node.setAttribute('target', '__blank');
    }
  }

  renderAwayMessage(messengerData: any) {
    const { isOnline } = this.props;

    if (messengerData && !isOnline && messengerData.awayMessage) {
      return (
        <li className="erxes-spacial-message away">
          {messengerData.awayMessage}
        </li>
      );
    }

    return null;
  }

  renderWelcomeMessage(messengerData: any) {
    const { isOnline } = this.props;

    if (messengerData && isOnline && messengerData.welcomeMessage) {
      return (
        <li className="erxes-spacial-message">
          {messengerData.welcomeMessage}
        </li>
      );
    }

    return null;
  }

  render() {
    const { uiOptions, messengerData, messages } = this.props;
    const { color, wallpaper } = uiOptions;
    const messagesClasses = classNames('erxes-messages-list', {
      [`bg-${wallpaper}`]: wallpaper,
    });

    return (
      <ul
        id="erxes-messages"
        className={messagesClasses}
        ref={(node) => {
          this.node = node;
        }}>
        {this.renderWelcomeMessage(messengerData)}
        {messages.map((message) => <Message key={message._id} color={color} {...message} />)}
        {this.renderAwayMessage(messengerData)}
      </ul>
    );
  }
}

export default MessagesList;

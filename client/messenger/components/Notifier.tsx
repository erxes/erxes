import * as React from "react";
import * as striptags from "striptags";
import { EngageMessage, User } from "../components";
import { IMessage } from "../types";

type Props = {
  message: IMessage;
  readConversation: (conversationId: string) => void;
  showUnreadMessage: () => void;
};

class Notifier extends React.Component<Props> {
  componentDidMount() {
    this.props.showUnreadMessage();
  }

  componentDidUpdate() {
    this.props.showUnreadMessage();
  }

  renderNotificationBody() {
    const { message } = this.props;
    const { engageData, user, content } = message;

    let fullName = "";

    if (user && user.details) {
      fullName = user.details.fullName;
    }

    if (engageData) {
      return <EngageMessage engageData={engageData} />;
    }

    return (
      <div className="notification-wrapper">
        <div className="user-info">
          <User user={user} />
          {fullName}
        </div>
        <div className="notification-body">{striptags(content)}</div>
      </div>
    );
  }

  renderClass() {
    const { message } = this.props;

    if (message.engageData) {
      return `erxes-notification appear-scale-in ${message.engageData.sentAs}`;
    }

    return "erxes-notification appear-scale-in";
  }

  render() {
    const { message, readConversation } = this.props;

    return (
      <div
        className={this.renderClass()}
        onClick={() => readConversation(message.conversationId)}
      >
        {this.renderNotificationBody()}
      </div>
    );
  }
}

export default Notifier;

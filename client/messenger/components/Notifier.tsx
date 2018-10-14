import * as classNames from "classnames";
import * as React from "react";
import * as RTG from "react-transition-group";
import * as striptags from "striptags";
import { EngageMessage } from "../components";
import { User } from "../components/common";
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

  render() {
    const { message, readConversation } = this.props;
    const classes = classNames("erxes-notification", {
      "full-message": message.engageData.sentAs === "fullMessage"
    });

    return (
      <RTG.CSSTransition
        in={true}
        appear={true}
        timeout={300}
        classNames="scale-in"
        unmountOnExit
      >
        <div
          className={classes}
          onClick={() => readConversation(message.conversationId)}
        >
          {this.renderNotificationBody()}
        </div>
      </RTG.CSSTransition>
    );
  }
}

export default Notifier;

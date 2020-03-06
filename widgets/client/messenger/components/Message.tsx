import * as classNames from "classnames";
import * as moment from "moment";
import * as React from "react";
import * as xss from "xss";
import { defaultAvatar } from "../../icons/Icons";
import { IUser } from "../../types";
import { readFile } from "../../utils";
import { Attachment, User } from "../components/common";
import { IAttachment, IMessengerAppData } from "../types";

type Props = {
  content: string;
  createdAt: Date;
  messengerAppData: IMessengerAppData;
  attachments: IAttachment[];
  user?: IUser;
  color?: string;
};

class Message extends React.Component<Props> {
  renderMessengerAppMessage() {
    const { messengerAppData } = this.props;
    const image = messengerAppData.customer.avatar || defaultAvatar;
    const name = messengerAppData.customer.firstName || "N/A";

    return (
      <div className="app-message-box">
        <div className="user-info">
          <img src={readFile(image)} />
          <h2>Meet with {name}</h2>
        </div>
        <div className="call-button">
          <h3>Meeting Ready</h3>
          <a href={messengerAppData.hangoutLink} target="_blank">
            <button>Join Call</button>
          </a>
        </div>
      </div>
    );
  }

  renderAttachments() {
    const { attachments } = this.props;
    const hasAttachment = attachments && attachments.length > 0;

    if (hasAttachment) {
      const result: React.ReactNode[] = [];

      attachments.map(att => {
        result.push(<Attachment attachment={att} />);
      });

      return result;
    }

    return;
  }

  renderContent() {
    const { messengerAppData, attachments, color, user, content } = this.props;
    const messageClasses = classNames("erxes-message", {
      attachment: attachments && attachments.length > 0,
      "from-customer": !user
    });

    const messageBackground = {
      backgroundColor: !user ? color : ""
    };

    if (messengerAppData) {
      return this.renderMessengerAppMessage();
    }

    return (
      <div style={messageBackground} className={messageClasses}>
        {this.renderAttachments()}
        <span dangerouslySetInnerHTML={{ __html: xss(content) }} />
      </div>
    );
  }

  render() {
    const { user, createdAt } = this.props;
    const itemClasses = classNames({ "from-customer": !user });

    return (
      <li className={itemClasses}>
        {user ? <User user={user} /> : null}
        {this.renderContent()}
        <div className="date">
          <span
            className="erxes-tooltip"
            data-tooltip={moment(createdAt).format("YYYY-MM-DD, HH:mm:ss")}
          >
            {moment(createdAt).format("LT")}
          </span>
        </div>
      </li>
    );
  }
}

export default Message;

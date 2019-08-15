import * as classNames from "classnames";
import * as React from "react";
import * as striptags from "striptags";
import { IUser } from "../../types";
import { User } from "../components/common";
import { IEngageData } from "../types";

const Component = React.Component;

type Props = {
  engageData: IEngageData;
};

class EngageMessage extends Component<Props> {
  renderUserFullName(fromUser?: IUser) {
    if (fromUser && fromUser.details) {
      return fromUser.details.fullName;
    }
  }

  renderNotificationContent() {
    const { content, sentAs, fromUser } = this.props.engageData;

    if (sentAs === "badge") {
      return null;
    }

    const classes = classNames("notification-body", {
      "full-message": sentAs === "fullMessage"
    });

    const regex = /&nbsp;/gi;

    return (
      <>
        <div className="flex-notification">
          <div className="user-info">
            <User user={fromUser} />
            {this.renderUserFullName(fromUser)}
          </div>
          <div className={classes}>
            {sentAs === "fullMessage" ? (
              <span dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              striptags(content).replace(regex, " ")
            )}
          </div>
        </div>
      </>
    );
  }

  render() {
    return this.renderNotificationContent();
  }
}

export default EngageMessage;

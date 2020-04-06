import * as classNames from "classnames";
import * as React from "react";
import { IUser } from "../../types";
import { striptags } from "../../utils";
import { User } from "../components/common";
import { IEngageData } from "../types";

const Component = React.Component;

type Props = {
  engageData: IEngageData;
  user?: IUser;
};

class EngageMessage extends Component<Props> {
  renderUserFullName(user?: IUser) {
    if (user && user.details) {
      return user.details.fullName;
    }
  }

  renderNotificationContent() {
    const { content, sentAs } = this.props.engageData;
    const { user } = this.props;

    if (sentAs === "badge") {
      return null;
    }

    const classes = classNames("notification-body", {
      "full-message": sentAs === "fullMessage"
    });

    return (
      <>
        <div className="flex-notification">
          <div className="user-info">
            <User user={user} />
            {this.renderUserFullName(user)}
          </div>
          <div className={classes}>
            {sentAs === "fullMessage" ? (
              <span dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              striptags(content)
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

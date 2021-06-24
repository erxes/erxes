import * as classNames from "classnames";
import * as React from "react";
import { defaultAvatar } from "../../../icons/Icons";
import { IUser, IUserDetails } from "../../../types";
import { __, readFile } from "../../../utils";

type Props = {
  users: IUser[];
  isOnline?: boolean;
  isExpanded?: boolean;
  loading?: boolean;
  color?: string;
};

class Supporters extends React.Component<Props> {
  getAvatar(avatar: string) {
    if (!avatar) {
      return defaultAvatar;
    }

    return avatar;
  }

  renderSupporter(user: IUser, isOnline: boolean, color: string) {
    const details = user.details || ({} as IUserDetails);
    return (
      <div
        key={user._id}
        className="erxes-supporter erxes-tooltip"
        data-tooltip={details.fullName}
      >
        <div className="avatar">
          <img
            key={user._id}
            src={readFile(this.getAvatar(details.avatar))}
            style={{ borderColor: color }}
            alt={details.fullName}
          />
          {this.renderOnlineState(isOnline)}
        </div>
        <span className="erxes-staff-name">{details.shortName}</span>
      </div>
    );
  }

  renderOnlineState(isOnline: boolean) {
    const stateClasses = classNames("erxes-state", {
      online: isOnline,
    });

    return <span className={stateClasses} />;
  }

  renderUsers() {
    const {
      users,
      isOnline = false,
      isExpanded = false,
      color = "",
    } = this.props;

    const activeUsers = users.filter((user) => user.isActive);

    const supporters = activeUsers.map((user) =>
      this.renderSupporter(user, isOnline, color)
    );

    const wrapperClass = classNames("erxes-supporters", {
      full: isExpanded,
    });

    return <div className={wrapperClass}>{supporters}</div>;
  }

  render() {
    const { users, loading, isExpanded } = this.props;

    if (loading) {
      return (
        <div className="loader-wrapper">
          <div className="loader" />
        </div>
      );
    }

    if (users.length !== 0) {
      return this.renderUsers();
    }

    if (isExpanded) {
      return null;
    }

    return (
      <div className="erxes-topbar-title">
        <div>{__("Conversation")}</div>
        <span>{__("with Support staff")}</span>
      </div>
    );
  }
}

export default Supporters;

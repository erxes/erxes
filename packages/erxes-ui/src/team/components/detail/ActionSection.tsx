import { IUser, IUserDetails } from "@erxes/ui/src/auth/types";
import { __, loadDynamicComponent } from "@erxes/ui/src/utils";

import { Actions } from "@erxes/ui/src/styles/main";
import Button from "@erxes/ui/src/components/Button";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import DropdownToggle from "@erxes/ui/src/components/DropdownToggle";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";
import Tip from "@erxes/ui/src/components/Tip";
import UserResetPasswordForm from "../../containers/UserResetPasswordForm";

type Props = {
  user: IUser;
  isSmall?: boolean;
  resendInvitation: (email: string) => void;
  changeStatus: (id: string) => void;
  renderEditForm: ({
    closeModal,
    user,
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
};

class ActionSection extends React.Component<Props> {
  renderActions() {
    const { user } = this.props;
    const { operatorPhone } = user.details || ({} as IUserDetails);

    return (
      <>
        {loadDynamicComponent("actionForms", { user }, true)}
        <Button
          href={operatorPhone && `tel:${operatorPhone}`}
          size="small"
          btnStyle={operatorPhone ? "primary" : "simple"}
          disabled={operatorPhone ? false : true}
        >
          <Tip text="Call" placement="top-end">
            <Icon icon="phone" />
          </Tip>
        </Button>
      </>
    );
  }

  renderButton() {
    const { isSmall } = this.props;

    return (
      <Button size="small" btnStyle="default">
        {isSmall ? (
          <Icon icon="ellipsis-h" />
        ) : (
          <>
            {__("Action")} <Icon icon="angle-down" />
          </>
        )}
      </Button>
    );
  }

  renderResendInvitation = () => {
    const { user, resendInvitation } = this.props;

    const onClick = () => {
      resendInvitation(user.email);
    };

    if (user.status !== "Not verified") {
      return null;
    }

    return (
      <li>
        <a href="#resend" onClick={onClick}>
          {__("Resend Invitation")}
        </a>
      </li>
    );
  };

  renderDeActivate = () => {
    const { user, changeStatus } = this.props;

    const onClick = () => {
      changeStatus(user._id);
    };

    return (
      <li>
        <a href="#deactivate" onClick={onClick}>
          {user.isActive ? __("Deactivate") : __("Activate")}
        </a>
      </li>
    );
  };

  renderDropdown() {
    const { user, renderEditForm } = this.props;

    const userEditForm = (props) => {
      return renderEditForm({ ...props, user });
    };

    const userResetPasswordForm = (props) => {
      return <UserResetPasswordForm {...props} object={this.props.user} />;
    };

    const menuItems = [
      {
        title: "Edit basic info",
        trigger: <a href="#edit">{__("Edit Profile")}</a>,
        content: userEditForm,
        additionalModalProps: { size: "lg" },
      },
      {
        title: "Reset member password",
        trigger: <a href="#reset">{__("Reset Password")}</a>,
        content: userResetPasswordForm,
      },
    ];

    return (
      <Dropdown
        as={DropdownToggle}
        toggleComponent={this.renderButton()}
        modalMenuItems={menuItems}
      >
        {this.renderResendInvitation()}
        {this.renderDeActivate()}
      </Dropdown>
    );
  }

  render() {
    return (
      <Actions>
        {this.renderActions()}
        {this.renderDropdown()}
      </Actions>
    );
  }
}

export default ActionSection;

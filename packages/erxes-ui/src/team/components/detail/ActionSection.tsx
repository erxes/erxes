import { IUser, IUserDetails } from '@erxes/ui/src/auth/types';
import { __, loadDynamicComponent } from '@erxes/ui/src/utils';

import { Actions } from '@erxes/ui/src/styles/main';
import Button from '@erxes/ui/src/components/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import UserResetPasswordForm from '../../containers/UserResetPasswordForm';

type Props = {
  user: IUser;
  isSmall?: boolean;
  resendInvitation: (email: string) => void;
  changeStatus: (id: string) => void;
  renderEditForm: ({
    closeModal,
    user
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
        {loadDynamicComponent('actionForms', { user })}
        <Button
          href={operatorPhone && `tel:${operatorPhone}`}
          size="small"
          btnStyle={operatorPhone ? 'primary' : 'simple'}
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
            {__('Action')} <Icon icon="angle-down" />
          </>
        )}
      </Button>
    );
  }

  renderEditButton() {
    const { user, renderEditForm } = this.props;

    const userForm = props => {
      return renderEditForm({ ...props, user });
    };

    return (
      <li>
        <ModalTrigger
          title="Edit basic info"
          trigger={<a href="#edit">{__('Edit Profile')}</a>}
          size="lg"
          content={userForm}
        />
      </li>
    );
  }

  renderResendInvitation = () => {
    const { user, resendInvitation } = this.props;

    const onClick = () => {
      resendInvitation(user.email);
    };

    if (user.status !== 'Not verified') {
      return null;
    }

    return (
      <li>
        <a href="#resend" onClick={onClick}>
          {__('Resend Invitation')}
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
          {user.isActive ? __('Deactivate') : __('Activate')}
        </a>
      </li>
    );
  };

  renderResetPassword = () => {
    const content = props => {
      return <UserResetPasswordForm {...props} object={this.props.user} />;
    };

    return (
      <ModalTrigger
        title="Reset member password"
        trigger={
          <li>
            <a href="#reset">{__('Reset Password')}</a>
          </li>
        }
        content={content}
      />
    );
  };

  renderDropdown() {
    return (
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-action">
          {this.renderButton()}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {this.renderEditButton()}
          {this.renderResendInvitation()}
          {this.renderResetPassword()}
          {this.renderDeActivate()}
        </Dropdown.Menu>
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

import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { Actions, MailBox } from 'modules/customers/styles';
import MailForm from 'modules/settings/integrations/containers/mail/MailForm';
import SmsForm from 'modules/settings/integrations/containers/telnyx/SmsForm';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { IUser, IUserDetails } from 'modules/auth/types';
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

    const content = props => (
      <MailBox>
        <MailForm
          fromEmail={user.email}
          customerId={user._id || undefined}
          refetchQueries={['activityLogsUser']}
          closeModal={props.closeModal}
        />
      </MailBox>
    );

    const smsForm = props => (
      <SmsForm {...props} primaryPhone={operatorPhone} />
    );

    return (
      <>
        <ModalTrigger
          dialogClassName="middle"
          title="Email"
          trigger={
            <Button
              disabled={user.email ? false : true}
              size="small"
              btnStyle={user.email ? 'primary' : 'simple'}
            >
              <Tip text="Send e-mail" placement="top-end">
                <Icon icon="envelope" />
              </Tip>
            </Button>
          }
          size="lg"
          content={content}
          paddingContent="less-padding"
          enforceFocus={false}
        />
        <ModalTrigger
          dialogClassName="middle"
          title={`Send SMS to (${operatorPhone})`}
          trigger={
            <Button
              disabled={operatorPhone ? false : true}
              size="small"
              btnStyle={operatorPhone ? 'primary' : 'simple'}
            >
              <Tip text="Send SMS" placement="top-end">
                <Icon icon="message" />
              </Tip>
            </Button>
          }
          content={smsForm}
        />
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

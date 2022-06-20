import { MailBox } from '@erxes/ui-contacts/src/customers/styles';
import MailForm from '@erxes/ui-settings/src/integrations/containers/mail/MailForm';
import SmsForm from '@erxes/ui-settings/src/integrations/containers/telnyx/SmsForm';
import {
  __,
  Alert,
  Button,
  confirm,
  DropdownToggle,
  Icon,
  ModalTrigger,
  Tip
} from '@erxes/ui/src';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import ClientPortalUserForm from '../../containers/ClientPortalUserForm';
import { Actions } from '@erxes/ui/src/styles/main';
import { IClientPortalUser } from '../../types';

type Props = {
  clientPortalUser: IClientPortalUser;
  remove: () => void;
  isSmall?: boolean;
};

class BasicInfoSection extends React.Component<Props> {
  renderActions() {
    const { clientPortalUser } = this.props;
    const { phone, email } = clientPortalUser;

    const content = props => (
      <MailBox>
        <MailForm
          fromEmail={email}
          customerId={clientPortalUser._id || undefined}
          closeModal={props.closeModal}
        />
      </MailBox>
    );

    const smsForm = props => <SmsForm {...props} phone={phone} />;

    return (
      <>
        <ModalTrigger
          dialogClassName="middle"
          title="Email"
          trigger={
            <Button
              disabled={email ? false : true}
              size="small"
              btnStyle={email ? 'primary' : 'simple'}
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
          title={`Send SMS to (${phone})`}
          trigger={
            <Button
              disabled={phone ? false : true}
              size="small"
              btnStyle={phone ? 'primary' : 'simple'}
            >
              <Tip text="Send SMS" placement="top-end">
                <Icon icon="message" />
              </Tip>
            </Button>
          }
          content={smsForm}
        />
        <Button
          href={phone && `tel:${phone}`}
          size="small"
          btnStyle={phone ? 'primary' : 'simple'}
          disabled={phone ? false : true}
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
    const { clientPortalUser } = this.props;

    const customerForm = props => {
      return (
        <ClientPortalUserForm
          {...props}
          size="lg"
          clientPortalUser={clientPortalUser}
        />
      );
    };

    return (
      <li>
        <ModalTrigger
          title="Edit basic info"
          trigger={<a href="#edit">{__('Edit')}</a>}
          size="lg"
          content={customerForm}
        />
      </li>
    );
  }

  renderDropdown() {
    const { remove, clientPortalUser } = this.props;

    const onClick = () =>
      confirm()
        .then(() => remove())
        .catch(error => {
          Alert.error(error.message);
        });

    return (
      <Dropdown>
        <Dropdown.Toggle as={DropdownToggle} id="dropdown-action">
          {this.renderButton()}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {this.renderEditButton()}
          <li>
            <a href="#delete" onClick={onClick}>
              {__('Delete')}
            </a>
          </li>
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

export default BasicInfoSection;

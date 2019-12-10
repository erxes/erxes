import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __, Alert, confirm } from 'modules/common/utils';
import TargetMerge from 'modules/customers/components/common/TargetMerge';
import CustomersMerge from 'modules/customers/components/detail/CustomersMerge';
import CustomerForm from 'modules/customers/containers/CustomerForm';
import { ICustomer } from 'modules/customers/types';
import {
  Actions,
  MailBox
} from 'modules/inbox/components/conversationDetail/sidebar/styles';
import MailForm from 'modules/settings/integrations/containers/mail/MailForm';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';

type Props = {
  customer: ICustomer;
  remove: () => void;
  merge: (doc: { ids: string[]; data: ICustomer }) => void;
  searchCustomer: (value: string, callback: (objects: any[]) => void) => void;
  isSmall?: boolean;
};

class ActionSection extends React.Component<Props> {
  renderActions() {
    const { customer } = this.props;
    const { primaryPhone, primaryEmail } = customer;

    const content = props => (
      <MailBox>
        <MailForm
          fromEmail={primaryEmail}
          refetchQueries={['activityLogsCustomer']}
          closeModal={props.closeModal}
        />
      </MailBox>
    );

    return (
      <>
        <ModalTrigger
          dialogClassName="middle"
          title="Email"
          trigger={
            <Button disabled={primaryEmail ? false : true} size="small">
              {__('Email')}
            </Button>
          }
          size="lg"
          content={content}
          paddingContent="no-padding"
        />
        <Button
          href={primaryPhone && `tel:${primaryPhone}`}
          size="small"
          disabled={primaryPhone ? false : true}
        >
          {__('Call')}
        </Button>
      </>
    );
  }

  renderButton() {
    return (
      <Button size="small">
        {__('Action')} <Icon icon="angle-down" />
      </Button>
    );
  }

  renderEditButton() {
    const { customer } = this.props;

    const customerForm = props => {
      return <CustomerForm {...props} size="lg" customer={customer} />;
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

  render() {
    const { customer, merge, remove, searchCustomer } = this.props;

    const onClick = () =>
      confirm()
        .then(() => remove())
        .catch(error => {
          Alert.error(error.message);
        });

    const generateOptions = customers => {
      return customers.map((cus, key) => ({
        key,
        value: JSON.stringify(cus),
        label:
          cus.firstName ||
          cus.lastName ||
          cus.primaryEmail ||
          cus.primaryPhone ||
          'Unknown'
      }));
    };

    return (
      <Actions>
        {this.renderActions()}
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-action">
            {this.renderButton()}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {this.renderEditButton()}
            <li>
              <TargetMerge
                onSave={merge}
                object={customer}
                searchObject={searchCustomer}
                mergeForm={CustomersMerge}
                generateOptions={generateOptions}
              />
            </li>
            <li>
              <a href="#delete" onClick={onClick}>
                {__('Delete')}
              </a>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </Actions>
    );
  }
}

export default ActionSection;

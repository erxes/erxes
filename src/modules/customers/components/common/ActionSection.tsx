import Button from 'modules/common/components/Button';
import DropdownToggle from 'modules/common/components/DropdownToggle';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __, Alert, confirm } from 'modules/common/utils';
import TargetMerge from 'modules/customers/components/common/TargetMerge';
import CustomersMerge from 'modules/customers/components/detail/CustomersMerge';
import CustomerForm from 'modules/customers/containers/CustomerForm';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { Dropdown } from 'react-bootstrap';

type Props = {
  customer: ICustomer;
  remove: () => void;
  merge: (doc: { ids: string[]; data: ICustomer }) => void;
  searchCustomer: (value: string, callback: (objects: any[]) => void) => void;
  isSmall?: boolean;
};

class ActionSection extends React.Component<Props> {
  renderButton() {
    if (this.props.isSmall) {
      return (
        <Button size="small">
          {__('Action')} <Icon icon="downarrow" />
        </Button>
      );
    }

    return (
      <Button btnStyle="simple" size="medium" icon="downarrow">
        {__('Action')}
      </Button>
    );
  }

  renderEditButton() {
    const { customer, isSmall } = this.props;

    if (!isSmall) {
      return null;
    }

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
      <Dropdown id="dropdown-engage">
        <DropdownToggle bsRole="toggle">{this.renderButton()}</DropdownToggle>
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
    );
  }
}

export default ActionSection;

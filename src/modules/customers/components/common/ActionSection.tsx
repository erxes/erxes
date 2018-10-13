import { Button, DropdownToggle, Icon } from 'modules/common/components';
import { __, confirm, searchCustomer } from 'modules/common/utils';
import { CustomersMerge, TargetMerge } from 'modules/customers/components';
import { ICustomer } from 'modules/customers/types';
import * as React from 'react';
import { Dropdown } from 'react-bootstrap';

type Props = {
  customer: ICustomer;
  remove: () => void;
  merge: (doc: { ids: string[]; data: ICustomer }) => void;
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

  render() {
    const { customer, remove, merge } = this.props;

    return (
      <Dropdown id="dropdown-engage">
        <DropdownToggle bsRole="toggle">{this.renderButton()}</DropdownToggle>
        <Dropdown.Menu>
          <li>
            <TargetMerge
              onSave={merge}
              object={customer}
              searchObject={searchCustomer}
              mergeForm={CustomersMerge}
              generateOptions={customers => {
                return customers.map((cus, key) => ({
                  key,
                  value: JSON.stringify(cus),
                  label:
                    cus.firstName ||
                    cus.lastName ||
                    cus.primaryEmail ||
                    cus.primaryPhone ||
                    'N/A'
                }));
              }}
            />
          </li>
          <li>
            <a onClick={() => confirm().then(() => remove())}>{__('Delete')}</a>
          </li>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default ActionSection;

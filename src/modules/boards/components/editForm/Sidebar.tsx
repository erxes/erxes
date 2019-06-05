import { Button } from 'modules/common/components';
import { CompanySection } from 'modules/companies/components';
import { ICompany } from 'modules/companies/types';
import { CustomerSection } from 'modules/customers/components/common';
import { ICustomer } from 'modules/customers/types';
import * as React from 'react';
import { RightContent } from '../../styles/item';
import { Item } from '../../types';

type Props = {
  item: Item;
  customers: ICustomer[];
  companies: ICompany[];
  onChangeField?: (name: 'companies' | 'customers', value: any) => void;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  sidebar?: () => React.ReactNode;
};

class Sidebar extends React.Component<Props> {
  onChange = (type, value) => {
    const { onChangeField } = this.props;

    if (onChangeField) {
      onChangeField(type, value);
    }
  };

  render() {
    const {
      customers,
      companies,
      item,
      copyItem,
      removeItem,
      sidebar
    } = this.props;

    const cmpsChange = cmps => this.onChange('companies', cmps);
    const cmrsChange = cmrs => this.onChange('customers', cmrs);
    const onClick = () => removeItem(item._id);

    return (
      <RightContent>
        {sidebar && sidebar()}

        <CompanySection
          name="Deal"
          companies={companies}
          onSelect={cmpsChange}
        />

        <CustomerSection
          name="Deal"
          customers={customers}
          onSelect={cmrsChange}
        />

        <Button icon="checked-1" onClick={copyItem}>
          Copy
        </Button>

        <Button icon="cancel-1" onClick={onClick}>
          Delete
        </Button>
      </RightContent>
    );
  }
}

export default Sidebar;

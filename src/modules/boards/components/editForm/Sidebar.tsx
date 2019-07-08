import { Button } from 'modules/common/components';
import { CompanySection } from 'modules/companies/components';
import { ICompany } from 'modules/companies/types';
import { CustomerSection } from 'modules/customers/components/common';
import { ICustomer } from 'modules/customers/types';
import React from 'react';
import { Watch } from '../../containers/editForm/';
import { RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';

type Props = {
  item: IItem;
  customers: ICustomer[];
  companies: ICompany[];
  onChangeField?: (name: 'companies' | 'customers', value: any) => void;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  sidebar?: () => React.ReactNode;
  options: IOptions;
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
      sidebar,
      options
    } = this.props;

    const cmpsChange = cmps => this.onChange('companies', cmps);
    const cmrsChange = cmrs => this.onChange('customers', cmrs);
    const onClick = () => removeItem(item._id);

    return (
      <RightContent>
        {sidebar && sidebar()}

        <CompanySection
          name={options.title}
          companies={companies}
          onSelect={cmpsChange}
        />

        <CustomerSection
          name={options.title}
          customers={customers}
          onSelect={cmrsChange}
        />

        <Watch item={item} options={options} />

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

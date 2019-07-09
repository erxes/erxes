import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import CompanySection from 'modules/companies/components/common/CompanySection';
import { ICompany } from 'modules/companies/types';
import CustomerSection from 'modules/customers/components/common/CustomerSection';
import { ICustomer } from 'modules/customers/types';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import { Watch } from '../../containers/editForm/';
import { RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';
type Props = {
  item: IItem;
  customers: ICustomer[];
  companies: ICompany[];
  assignedUserIds: string[];
  onChangeField?: (
    name: 'companies' | 'customers' | 'assignedUserIds',
    value: any
  ) => void;
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
      options,
      assignedUserIds
    } = this.props;

    const cmpsChange = cmps => this.onChange('companies', cmps);
    const cmrsChange = cmrs => this.onChange('customers', cmrs);
    const onClick = () => removeItem(item._id);
    const userOnChange = usrs => this.onChange('assignedUserIds', usrs);
    return (
      <RightContent>
        <FormGroup>
          <ControlLabel>Assigned to</ControlLabel>
          <SelectTeamMembers
            label="Choose users"
            name="assignedUserIds"
            value={assignedUserIds}
            onSelect={userOnChange}
            filterParams={{ status: 'verified' }}
          />
        </FormGroup>
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

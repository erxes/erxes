import ChecklistAdd from 'modules/checklists/components/AddButton';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import CompanySection from 'modules/companies/components/common/CompanySection';
import CustomerSection from 'modules/customers/components/common/CustomerSection';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import { Watch } from '../../containers/editForm/';
import { RightButton, RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';

type Props = {
  item: IItem;
  assignedUserIds: string[];
  onChangeField?: (
    name: 'companies' | 'customers' | 'assignedUserIds',
    value: any
  ) => void;
  copyItem: () => void;
  removeItem: (itemId: string) => void;
  sidebar?: () => React.ReactNode;
  options: IOptions;
  renderItems: () => React.ReactNode;
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
      item,
      copyItem,
      removeItem,
      sidebar,
      options,
      assignedUserIds,
      renderItems
    } = this.props;

    const onClick = () => removeItem(item._id);
    const userOnChange = usrs => this.onChange('assignedUserIds', usrs);
    const cmpsChange = cmps => this.onChange('companies', cmps);
    const cmrsChange = cmrs => this.onChange('customers', cmrs);

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
          mainType={options.type}
          mainTypeId={item._id}
          onSelect={cmpsChange}
        />

        <CustomerSection
          mainType={options.type}
          mainTypeId={item._id}
          onSelect={cmrsChange}
        />

        {renderItems()}

        <Watch item={item} options={options} />

        <ChecklistAdd itemId={item._id} type={options.type} />

        <RightButton icon="checked-1" onClick={copyItem}>
          Copy
        </RightButton>

        <RightButton icon="cancel-1" onClick={onClick}>
          Delete
        </RightButton>
      </RightContent>
    );
  }
}

export default Sidebar;

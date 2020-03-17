import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import CompanySection from 'modules/companies/components/common/CompanySection';
import CustomerSection from 'modules/customers/components/common/CustomerSection';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import { RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';

type Props = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }) => void;
  sidebar?: (
    saveItem?: (doc: { [key: string]: any }) => void
  ) => React.ReactNode;
  options: IOptions;
  renderItems: () => React.ReactNode;
};

class Sidebar extends React.Component<Props> {
  render() {
    const { item, saveItem, sidebar, options, renderItems } = this.props;

    const userOnChange = usrs => saveItem({ assignedUserIds: usrs });
    const cmpsChange = cmps => saveItem({ companies: cmps });
    const cmrsChange = cmrs => saveItem({ customers: cmrs });
    const assignedUserIds = (item.assignedUsers || []).map(user => user._id);

    return (
      <RightContent>
        <FormGroup>
          <ControlLabel>Assigned to</ControlLabel>
          <SelectTeamMembers
            label="Choose users"
            name="assignedUserIds"
            value={assignedUserIds}
            onSelect={userOnChange}
          />
        </FormGroup>

        {sidebar && sidebar(saveItem)}

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
      </RightContent>
    );
  }
}

export default Sidebar;

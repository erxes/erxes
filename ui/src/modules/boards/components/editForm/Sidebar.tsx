import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import SelectTeamMembers from 'modules/settings/team/containers/SelectTeamMembers';
import React from 'react';
import { RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';
import SidebarConformity from './SidebarConformity';

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
    const { item, saveItem, sidebar } = this.props;

    const userOnChange = usrs => saveItem({ assignedUserIds: usrs });
    const assignedUserIds = (item.assignedUsers || []).map(user => user._id);

    return (
      <RightContent>
        <FormGroup>
          <ControlLabel>Assigned to</ControlLabel>
          <SelectTeamMembers
            label="Choose users"
            name="assignedUserIds"
            initialValue={assignedUserIds}
            onSelect={userOnChange}
          />
        </FormGroup>

        {sidebar && sidebar(saveItem)}

        <SidebarConformity {...this.props} />
      </RightContent>
    );
  }
}

export default Sidebar;

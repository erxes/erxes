import CustomFieldsSection from '../../containers/editForm/CustomFieldsSection';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import React from 'react';
import { RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';
import SidebarConformity from './SidebarConformity';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }) => void;
  sidebar?: (
    saveItem?: (doc: { [key: string]: any }) => void
  ) => React.ReactNode;
  options: IOptions;
  renderItems: () => React.ReactNode;
  updateTimeTrack: (
    {
      _id,
      status,
      timeSpent
    }: { _id: string; status: string; timeSpent: number; startDate?: string },
    callback?: () => void
  ) => void;
};

class Sidebar extends React.Component<Props> {
  render() {
    const { item, saveItem, sidebar, options } = this.props;

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

        {isEnabled('products') && sidebar && sidebar(saveItem)}

        <SidebarConformity {...this.props} />
        <CustomFieldsSection item={item} options={options} />
      </RightContent>
    );
  }
}

export default Sidebar;

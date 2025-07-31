import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import React from 'react';
import { RightContent } from '../../styles/item';
import { IItem, IOptions } from '../../types';
import SidebarConformity from './SidebarConformity';
import { __ } from '@erxes/ui/src/utils';
import SelectNewBranches from '@erxes/ui/src/team/containers/SelectNewBranches';

import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  item: IItem;
  saveItem: (doc: { [key: string]: any }) => void;
  sidebar?: (
    saveItem?: (doc: { [key: string]: any }) => void,
  ) => React.ReactNode;
  options: IOptions;
  renderItems: () => React.ReactNode;
  updateTimeTrack: (
    {
      _id,
      status,
      timeSpent,
    }: { _id: string; status: string; timeSpent: number; startDate?: string },
    callback?: () => void,
  ) => void;
  childrenSection: () => any;
  currentUser: IUser;
};

class Sidebar extends React.Component<Props> {
  render() {
    const { item, saveItem, sidebar, childrenSection, currentUser } =
      this.props;
    const userOnChange = (usrs) => saveItem({ assignedUserIds: usrs });
    const onChangeStructure = (values, name) => saveItem({ [name]: values });
    const assignedUserIds = (item.assignedUsers || []).map((user) => user._id);
    const branchIds = item?.branchIds;
    const departmentIds = item?.departmentIds;
    return (
      <RightContent>
        <FormGroup>
          <FormGroup>
            <ControlLabel>{__('Branches')}</ControlLabel>
            <SelectNewBranches
              name="branchIds"
              label="Choose branches"
              initialValue={item?.branchIds}
              onSelect={onChangeStructure}
              filterParams={{
                withoutUserFilter: true,
                searchValue: 'search term',
              }}
            />
          </FormGroup>
          <ControlLabel>Assigned to</ControlLabel>
          <SelectTeamMembers
            label="Choose users"
            name="assignedUserIds"
            initialValue={assignedUserIds}
            onSelect={userOnChange}
            filterParams={{
              isAssignee: true,
              departmentIds,
              branchIds,
            }}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Departments')}</ControlLabel>
          <SelectDepartments
            name="departmentIds"
            label="Choose departments"
            onSelect={onChangeStructure}
            initialValue={item?.departmentIds}
          />
        </FormGroup>
        {sidebar && sidebar(saveItem)}

        <SidebarConformity {...this.props} />
        {childrenSection()}
      </RightContent>
    );
  }
}

export default Sidebar;

import React, { useState } from 'react';
import {
  ControlLabel,
  FormControl,
  TabTitle,
  Tabs
} from '@erxes/ui/src/components';
import { CenterBar, FlexColumn } from '../../styles';
import { __ } from '@erxes/ui/src/utils';
import { FlexRow } from '@erxes/ui-settings/src/styles';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

const ReportFormModal = () => {
  const [visibility, setVisibility] = useState('public');
  const [userIds, setUserIds] = useState([]);
  const [departmentIds, setDepartmentIds] = useState([]);

  const handleUserChange = _userIds => {
    setUserIds(_userIds);
  };

  const handleDepartmentChange = _departmentIds => {
    setDepartmentIds(_departmentIds);
  };

  return (
    <FlexColumn style={{ gap: '20px' }}>
      <div>
        <ControlLabel>Report Name</ControlLabel>
        <FormControl type="text" />
      </div>

      <FlexRow justifyContent="space-between">
        <ControlLabel>Visibility</ControlLabel>
        <CenterBar>
          <Tabs full={true}>
            <TabTitle
              className={visibility === 'public' ? 'active' : ''}
              onClick={() => setVisibility('public')}
            >
              {__('Public')}
            </TabTitle>
            <TabTitle
              className={visibility === 'private' ? 'active' : ''}
              onClick={() => setVisibility('private')}
            >
              {__('Private')}
            </TabTitle>
          </Tabs>
        </CenterBar>
      </FlexRow>
      {visibility === 'private' && (
        <>
          <ControlLabel>Select members or departments</ControlLabel>
          <SelectTeamMembers
            label={'Choose team members'}
            name="assignedUserIds"
            onSelect={handleUserChange}
          />
          <SelectDepartments
            name="assignedDepartmentIds"
            label={'Select departments'}
            onSelect={handleDepartmentChange}
          />
        </>
      )}
    </FlexColumn>
  );
};

export default ReportFormModal;

import React, { useState } from 'react';
import {
  Button,
  ControlLabel,
  FormControl,
  TabTitle,
  Tabs
} from '@erxes/ui/src/components';
import { CenterBar, FlexCenter, FlexColumn } from '../../styles';
import { __ } from '@erxes/ui/src/utils';
import { FlexRow } from '@erxes/ui-settings/src/styles';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  history: any;
  queryParams: any;

  chartTemplates: any[];
  createReport(values: any): void;
  setShowModal(showModal: boolean): void;
};

const ReportFormModal = (props: Props) => {
  const { createReport, setShowModal } = props;

  const [visibility, setVisibility] = useState('public');
  const [userIds, setUserIds] = useState([]);
  const [departmentIds, setDepartmentIds] = useState([]);
  const [name, setName] = useState('');

  const handleUserChange = _userIds => {
    setUserIds(_userIds);
  };

  const handleDepartmentChange = _departmentIds => {
    setDepartmentIds(_departmentIds);
  };

  const handleNameChange = e => {
    e.preventDefault();
    setName(e.target.value);
  };

  const handleSubmit = async () => {
    createReport({
      name,
      visibility,
      assignedUserIds: userIds,
      assignedDepartmentIds: departmentIds
    });
  };
  return (
    <FlexColumn style={{ gap: '20px' }}>
      <div>
        <ControlLabel>Report Name</ControlLabel>
        <FormControl type="text" onChange={handleNameChange} />
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

      <FlexCenter>
        <Button btnStyle="primary" onClick={() => setShowModal(false)}>
          Close
        </Button>
        <Button btnStyle="success" onClick={handleSubmit}>
          Save Changes
        </Button>
      </FlexCenter>
    </FlexColumn>
  );
};

export default ReportFormModal;

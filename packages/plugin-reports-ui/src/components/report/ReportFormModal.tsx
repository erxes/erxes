import React, { useState, useEffect } from 'react';
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
import SelectMembersForm from '../utils/SelectMembersForm';

type Props = {
  history: any;
  queryParams: any;

  chartTemplates: any[];
  reportName?: string;
  reportTemplateType?: string | null;
  createReport(values: any): void;
  setShowModal(showModal: boolean): void;
};

const ReportFormModal = (props: Props) => {
  const {
    createReport,
    setShowModal,
    reportTemplateType,
    reportName,
    chartTemplates
  } = props;

  const [totalFilters, setTotalFilters] = useState<any[]>([{}]);
  const [visibility, setVisibility] = useState('public');
  const [userIds, setUserIds] = useState([]);
  const [departmentIds, setDepartmentIds] = useState([]);
  const [name, setName] = useState(reportName || '');

  useEffect(() => {
    // const getFilters = [...chartTemplates.map(c => c.filterTypes)];

    const getFilters: any[] = [];

    for (const chartTemplate of chartTemplates) {
      getFilters.push(...chartTemplate.filterTypes);
    }
    setTotalFilters(getFilters);
  }, [chartTemplates]);

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
      assignedDepartmentIds: departmentIds,
      reportTemplateType
    });
  };
  return (
    <FlexColumn style={{ gap: '20px' }}>
      <div>
        <ControlLabel>Report Name</ControlLabel>
        <FormControl
          type="text"
          onChange={handleNameChange}
          value={name}
          autoFocus={true}
        />
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
        <SelectMembersForm
          handleDepartmentChange={handleDepartmentChange}
          handleUserChange={handleUserChange}
        />
      )}

      {chartTemplates.map(chartTemplate => {
        return (
          <FlexRow
            key={chartTemplate.templateType}
            justifyContent="space-between"
          >
            <ControlLabel>{chartTemplate.name}</ControlLabel>
            <FormControl
              componentClass="checkbox"
              key={chartTemplate.name}
              checked={true}
            />
          </FlexRow>
        );
      })}

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

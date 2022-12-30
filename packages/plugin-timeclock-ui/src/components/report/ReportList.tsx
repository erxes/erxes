import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Table from '@erxes/ui/src/components/table';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Select from 'react-select-plus';
import SelectDepartments from '@erxes/ui-settings/src/departments/containers/SelectDepartments';
import Button from '@erxes/ui/src/components/Button';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import ReportRow from './ReportRow';
import { IReport } from '../../types';
import {
  FilterWrapper,
  Row,
  FilterItem,
  CustomRangeContainer
} from '../../styles';
import { IBranch } from '@erxes/ui/src/team/types';

type Props = {
  queryParams: any;
  history: any;
  branchesList: IBranch[];
  reports: IReport[];
  getActionBar: (actionBar: any) => void;
};

function ReportList(props: Props) {
  const { history, branchesList, reports, getActionBar } = props;
  const [selectedBranchId, setBranches] = useState(['']);
  const [selectedDeptId, setDepartments] = useState('');
  const [selectedType, setType] = useState('By Employee');
  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('Shift date')}</th>
          <th>{__('Shift duration')}</th>
          <th>{__('Mins late')}</th>
          <th>{__('Shifts total')}</th>
          <th>{__('Total mins late')}</th>
          <th>{__('Total mins absent')}</th>
        </tr>
      </thead>
      {reports &&
        reports.map(reportt => (
          <ReportRow
            key={Math.random()}
            displayType={selectedType}
            report={reportt}
          />
        ))}
    </Table>
  );

  const renderSelectionBar = () => {
    const onTypeSelect = type => {
      localStorage.setItem('displayType', JSON.stringify(type));
      const selType = JSON.parse(localStorage.getItem('displayType') || '[]')
        .value;
      setType(selType);
    };

    return (
      <>
        <FilterItem>
          <FormGroup>
            <ControlLabel>Select type</ControlLabel>
            <Select
              value={JSON.parse(localStorage.getItem('displayType') || '[]')}
              onChange={onTypeSelect}
              placeholder="Select type"
              multi={false}
              options={['By Employee', 'By Group'].map(ipt => ({
                value: ipt,
                label: __(ipt)
              }))}
            />
          </FormGroup>
        </FilterItem>
      </>
    );
  };
  const renderExportBtn = () => {
    return (
      <div>
        <Button>Export</Button>
      </div>
    );
  };

  const actionBar = (
    <Wrapper.ActionBar
      left={renderSelectionBar()}
      right={renderExportBtn()}
      hasFlex={true}
    />
  );

  getActionBar(actionBar);
  return <>{content}</>;
}

export default ReportList;

import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { menuTimeClock } from '../../menu';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
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

type Props = {
  queryParams: any;
  history: any;
  branchesList: any;
  reports: IReport[];
};

function ReportList(props: Props) {
  const { history, branchesList, reports } = props;
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
        <FilterItem>
          <CustomRangeContainer>
            <DateControl
              // value={new Date()}
              required={false}
              name="startDate"
              // onChange={onSelectDateChange}
              placeholder={'Starting date'}
              dateFormat={'YYYY-MM-DD'}
            />
            <DateControl
              // value={new Date()}
              required={false}
              name="startDate"
              // onChange={onSelectDateChange}
              placeholder={'Ending date'}
              dateFormat={'YYYY-MM-DD'}
            />
            <Button btnStyle="primary">Filter</Button>
          </CustomRangeContainer>
        </FilterItem>
      </>
    );
  };
  const renderFilter = () => {
    const renderBranchOptions = (branches: any[]) => {
      return branches.map(branch => ({
        value: branch._id,
        label: branch.title
      }));
    };

    const onBranchSelect = selectedBranch => {
      setBranches(selectedBranch);

      const branchIds: any[] = [];
      selectedBranch.map(branch => branchIds.push(branch.value));

      router.setParams(history, {
        branchIds: `${branchIds}`
      });
    };

    const onDepartmentSelect = dept => {
      setDepartments(dept);
      const departmentIds: any[] = [];

      dept.map(department => departmentIds.push(department));

      router.setParams(history, {
        departmentIds: `${departmentIds}`
      });
    };

    return (
      <FilterWrapper>
        <FilterItem>
          <SelectDepartments
            isRequired={false}
            defaultValue={selectedDeptId}
            onChange={onDepartmentSelect}
          />
        </FilterItem>
        <FilterItem>
          <FormGroup>
            <ControlLabel>Branches</ControlLabel>
            <Row>
              <Select
                value={selectedBranchId}
                onChange={onBranchSelect}
                placeholder="Select branch"
                multi={true}
                options={branchesList && renderBranchOptions(branchesList)}
              />
            </Row>
          </FormGroup>
        </FilterItem>
        <div style={{ justifySelf: 'end' }}>
          <Button>Export</Button>
        </div>
      </FilterWrapper>
    );
  };

  const actionBar = (
    <Wrapper.ActionBar
      left={renderSelectionBar()}
      right={renderFilter()}
      hasFlex={true}
    />
  );

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Reports')} submenu={menuTimeClock} />}
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={false}
          emptyText={__('Theres no timeclock')}
          emptyImage="/images/actions/8.svg"
        />
      }
      transparent={false}
      hasBorder={true}
    />
  );
}

export default ReportList;

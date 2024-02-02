import Button from '@erxes/ui/src/components/Button';
import DateControl from '@erxes/ui/src/components/form/DateControl';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Icon from '@erxes/ui/src/components/Icon';
import Tip from '@erxes/ui/src/components/Tip';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import SelectUnits from '@erxes/ui/src/team/containers/SelectUnits';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

import { router, __ } from '@erxes/ui/src/utils';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { SidebarFilters } from '../styles';

type Props = {
  params: any;
};

const { Section } = Wrapper.Sidebar;

const Sidebar = (props: Props) => {
  const history = useHistory();

  const [filters, setFilters] = useState(props.params);
  const { branch, department, unit, startDate, contribution, endDate } =
    filters;

  const clearFilter = () => {
    router.removeParams(
      history,
      'branch',
      'department',
      'unit',
      'contribution',
      'startDate',
      'endDate',
      'page',
    );
  };

  const runFilter = () => {
    router.setParams(history, { ...filters });
  };

  const setFilter = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  return (
    <Wrapper.Sidebar hasBorder={true}>
      <Section.Title>
        {__('Filters')}
        <Section.QuickButtons>
          {!!Object.keys(props.params).length && (
            <a href="#cancel" tabIndex={0} onClick={clearFilter}>
              <Tip text={__('Clear filter')} placement="bottom">
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </Section.QuickButtons>
      </Section.Title>
      <SidebarFilters>
        <FormGroup>
          <ControlLabel>Start Date</ControlLabel>
          <DateControl
            value={startDate || ''}
            name="startDate"
            placeholder={'Start Date'}
            dateFormat={'YYYY-MM-DD'}
            onChange={(startDate: any) =>
              setFilter('startDate', dayjs(startDate).format('YYYY-MM-DD'))
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>End Date</ControlLabel>
          <DateControl
            value={endDate || ''}
            name="endDate"
            placeholder={'End Date'}
            dateFormat={'YYYY-MM-DD'}
            onChange={(endDate: any) =>
              setFilter('endDate', dayjs(endDate).format('YYYY-MM-DD'))
            }
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Branch</ControlLabel>
          <SelectBranches
            label="Choose branch"
            name="branch"
            initialValue={branch || ''}
            customOption={{
              value: '',
              label: '...Clear branch filter',
            }}
            onSelect={(branch) => setFilter('branch', branch)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Department</ControlLabel>
          <SelectDepartments
            label="Choose department"
            name="department"
            initialValue={department || ''}
            customOption={{
              value: '',
              label: '...Clear department filter',
            }}
            onSelect={(department) => setFilter('department', department)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Units</ControlLabel>
          <SelectUnits
            label="Choose Units"
            name="unit"
            initialValue={unit || ''}
            customOption={{
              value: '',
              label: '...Clear unit filter',
            }}
            onSelect={(unit) => setFilter('unit', unit)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>TeamMember</ControlLabel>
          <SelectTeamMembers
            label="Choose User"
            name="contribution"
            initialValue={contribution || ''}
            customOption={{
              value: '',
              label: '...Clear user filter',
            }}
            onSelect={(contribution) => setFilter('contribution', contribution)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <Button onClick={runFilter}>Filter</Button>
        </FormGroup>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
};

export default Sidebar;

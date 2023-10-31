import SelectProducts from '@erxes/ui-products/src/containers/SelectProducts';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
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

export default function Sidebar(props: Props) {
  const history = useHistory();

  const [filters, setFilters] = useState(props.params);
  const { branch, department, unit, date, contribution } = filters;

  const clearFilter = () => {
    router.removeParams(
      history,
      'branch',
      'department',
      'unit',
      'contribution',
      'date',
      'page'
    );
  };

  const runFilter = () => {
    router.setParams(history, { ...filters });
  };

  const setFilter = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  return (
    <Wrapper.Sidebar hasBorder>
      <Section.Title>
        {__('Filters')}
        <Section.QuickButtons>
          {(branch || department || unit || contribution || date) && (
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
          <ControlLabel>Date</ControlLabel>
          <DateControl
            value={date}
            timeFormat={'HH:mm'}
            name="date"
            placeholder={'date'}
            dateFormat={'YYYY-MM-DD'}
            onChange={(date: any) =>
              setFilter('date', dayjs(date).format('YYYY-MM-DD HH:mm'))
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
              label: '...Clear branch filter'
            }}
            onSelect={branch => setFilter('branch', branch)}
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
              label: '...Clear department filter'
            }}
            onSelect={department => setFilter('department', department)}
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
              label: '...Clear unit filter'
            }}
            onSelect={unit => setFilter('unit', unit)}
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
              label: '...Clear user filter'
            }}
            onSelect={contribution => setFilter('contribution', contribution)}
            multi={false}
          />
        </FormGroup>
        <FormGroup>
          <Button onClick={runFilter}>Filter</Button>
        </FormGroup>
      </SidebarFilters>
    </Wrapper.Sidebar>
  );
}

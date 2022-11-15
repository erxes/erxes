import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { menuTimeClock } from '../menu';
import { __ } from '@erxes/ui/src/utils';
import styled from 'styled-components';
import React from 'react';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Table from '@erxes/ui/src/components/table';
import { colors } from '@erxes/ui/src/styles';

import { DateContainer } from '@erxes/ui/src/styles/main';
import Select from 'react-select-plus';
import SelectDepartments from '@erxes/ui-settings/src/departments/containers/SelectDepartments';
import Button from '@erxes/ui/src/components/Button';
import Filter from '@erxes/ui/src/components/filter/Filter';

const FilterWrapper = styled.div`
  margin: 10px 20px 0 20px;
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};

  strong {
    margin-right: 2 0px;
  }
`;

const FilterItem = styled(DateContainer)`
  position: relative;
  float: left;
  min-width: 200px;
  margin-right: 20px;
  z-index: 100;
`;

type Props = {
  queryParams: any;
  history: any;
};

function ReportList(props: Props) {
  const { queryParams, history } = props;

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('Shift date')}</th>
          <th>{__('Arrival / Shift start')}</th>
          <th>{__('Departure / Shift end')}</th>
          <th>{__('Total mins late')}</th>
        </tr>
      </thead>
    </Table>
  );

  const actionBar = <Wrapper.ActionBar right={renderFilter()} hasFlex={true} />;

  const onDepartmentSelect = dept => {
    console.log(dept);
  };

  function renderFilter() {
    return (
      <FilterWrapper>
        <strong>{__('Filter')}</strong>
        <FilterItem>
          <SelectDepartments
            defaultValue={['123', '54345', '511']}
            isRequired={false}
            onChange={onDepartmentSelect}
          />
        </FilterItem>
        <FilterItem>
          <Select />
        </FilterItem>
        <div style={{ justifySelf: 'end' }}>
          <Button>Export</Button>
        </div>
      </FilterWrapper>
    );
  }

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Reports')} submenu={menuTimeClock} />}
      actionBar={actionBar}
      content={
        <>
          {/* {renderFilter()} */}
          <DataWithLoader
            data={content}
            loading={false}
            emptyText={__('Theres no timeclock')}
            emptyImage="/images/actions/8.svg"
          />
        </>
      }
      transparent={false}
      hasBorder={true}
    />
  );
}

export default ReportList;

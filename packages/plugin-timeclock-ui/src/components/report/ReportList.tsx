import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Table from '@erxes/ui/src/components/table';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Select from 'react-select-plus';
import Button from '@erxes/ui/src/components/Button';
import ReportRow from './ReportRow';
import { IReport } from '../../types';
import { FilterItem } from '../../styles';

type Props = {
  queryParams: any;
  history: any;
  reports: IReport[];
  getActionBar: (actionBar: any) => void;
};

function ReportList(props: Props) {
  const { history, reports, getActionBar } = props;
  const [selectedType, setType] = useState(
    localStorage.getItem('displayType') || ''
  );
  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member Id')}</th>
          <th>{__('Last Name')}</th>
          <th>{__('First Name')}</th>
          <th>{__('Branch Name')}</th>
          <th>{__('Position')}</th>
          <th>{__('Scheduled days')}</th>
          <th>{__('Worked days')}</th>
          <th>{__('Explanation')}</th>
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
      localStorage.setItem('displayType', type.value);
      router.setParams(history, { reportType: type.value });
      setType(type.value);
    };

    return (
      <>
        <FilterItem>
          <FormGroup>
            <ControlLabel>Select type</ControlLabel>
            <Select
              value={selectedType}
              onChange={onTypeSelect}
              placeholder="Select type"
              multi={false}
              options={['Урьдчилсан', 'Сүүлд'].map(ipt => ({
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
  return content;
}

export default ReportList;

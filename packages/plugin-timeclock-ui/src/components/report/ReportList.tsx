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
  exportReport: () => void;
};

function ReportList(props: Props) {
  const { history, reports, queryParams, getActionBar, exportReport } = props;
  const [selectedType, setType] = useState(queryParams.reportType);

  const renderTableHead = () => {
    switch (selectedType) {
      case 'Урьдчилсан':
        return (
          <tr>
            <th>{__('Team member Id')}</th>
            <th>{__('Last Name')}</th>
            <th>{__('First Name')}</th>
            <th>{__('Position')}</th>
            <th>{__('Scheduled days')}</th>
            <th>{__('Worked days')}</th>
            <th>{__('Explanation')}</th>
          </tr>
        );
      case 'Сүүлд':
        return (
          <>
            <tr>
              <th rowSpan={2}>{__('Team member Id')}</th>
              <th rowSpan={2}>{__('Last Name')}</th>
              <th rowSpan={2}>{__('First Name')}</th>
              <th rowSpan={2}>{__('Position')}</th>
              <th colSpan={2}>{__('Scheduled time')}</th>
              <th colSpan={6} style={{ textAlign: 'center' }}>
                {__('Timeclock info')}
              </th>
              <th colSpan={3} style={{ textAlign: 'center' }}>
                {__('Absence info')}
              </th>
            </tr>
            <tr>
              <td>{__('Days')}</td>
              <td>{__('Hours')}</td>
              <td>{__('Worked days')}</td>
              <td>{__('Worked hours')}</td>
              <td>{__('Overtime')}</td>
              <td>{__('Overnight')}</td>
              <td>{__('Total')}</td>
              <td>{__('Mins Late')}</td>
              <td>{__('-')}</td>
              <td>{__('-')}</td>
              <td>{__('-')}</td>
            </tr>
          </>
        );
      case 'Pivot':
        return (
          <>
            <tr>
              <th
                colSpan={4}
                style={{ textAlign: 'center', border: '1px solid #EEE' }}
              >
                {__('General Information')}
              </th>
              <th>{__('Time')}</th>
              <th
                colSpan={3}
                style={{ textAlign: 'center', border: '1px solid #EEE' }}
              >
                {__('Schedule')}
              </th>
              <th
                colSpan={8}
                style={{ textAlign: 'center', border: '1px solid #EEE' }}
              >
                {__('Performance')}
              </th>
            </tr>
            <tr>
              <td>{__('Team member Id')}</td>
              <td>{__('Last Name')}</td>
              <td>{__('First Name')}</td>
              <td>{__('Position')}</td>
              <td>{__('Date')}</td>
              <td>{__('Planned Check In')}</td>
              <td>{__('Planned Check Out')}</td>
              <td>{__('Planned Duration')}</td>
              <td>{__('Device type')}</td>
              <td>{__('Check In')}</td>
              <td>{__('Check Out')}</td>
              <td>{__('Location')}</td>
              <td>{__('Duration')}</td>
              <td>{__('Overtime')}</td>
              <td>{__('Overnight')}</td>
              <td>{__('Mins Late')}</td>
            </tr>
          </>
        );
    }
  };

  const content = (
    <Table>
      <thead>{renderTableHead()}</thead>
      {reports &&
        reports.map(reportt => (
          <ReportRow
            key={Math.random()}
            reportType={selectedType}
            report={reportt}
          />
        ))}
    </Table>
  );

  const renderSelectionBar = () => {
    const onTypeSelect = type => {
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
              options={['Урьдчилсан', 'Сүүлд', 'Pivot'].map(ipt => ({
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
        <Button onClick={exportReport}>Export</Button>
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

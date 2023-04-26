import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { loadDynamicComponent, router, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Table from '@erxes/ui/src/components/table';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Select from 'react-select-plus';
import Button from '@erxes/ui/src/components/Button';
import ReportRow from './ReportRow';
import { IReport } from '../../types';
import { FilterItem, FlexRow, ToggleButton } from '../../styles';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  queryParams: any;
  history: any;
  reports: IReport[];
  totalCount: number;

  showSideBar: (sideBar: boolean) => void;
  getActionBar: (actionBar: any) => void;
  getPagination: (pagination: any) => void;

  exportReport: () => void;
};

function ReportList(props: Props) {
  const {
    history,
    reports,
    queryParams,
    totalCount,
    getActionBar,
    getPagination,
    exportReport,
    showSideBar
  } = props;

  const [reportType, setType] = useState(queryParams.reportType);
  const [isSideBarOpen, setIsOpen] = useState(
    localStorage.getItem('isSideBarOpen') === 'true' ? true : false
  );

  const onToggleSidebar = () => {
    const toggleIsOpen = !isSideBarOpen;
    setIsOpen(toggleIsOpen);
    localStorage.setItem('isSideBarOpen', toggleIsOpen.toString());
  };

  const renderTableHead = () => {
    switch (reportType) {
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
              <th colSpan={7} style={{ textAlign: 'center' }}>
                {__('Timeclock info')}
              </th>
              <th colSpan={4} style={{ textAlign: 'center' }}>
                {__('Absence info')}
              </th>
              <th rowSpan={2}>{__('Checked by member')}</th>
            </tr>
            <tr>
              <td>{__('Days')}</td>
              <td>{__('Hours')}</td>
              <td>{__('Total break')}</td>
              <td>{__('Worked days')}</td>
              <td>{__('Worked hours')}</td>
              <td>{__('Overtime')}</td>
              <td>{__('Overnight')}</td>
              <td>{__('Total')}</td>
              <td>{__('Mins Late')}</td>
              <td>{__('Томилолтоор ажилласан цаг')}</td>
              <td>{__('Чөлөөтэй цаг цалинтай')}</td>
              <td>{__('Чөлөөтэй цаг цалингүй')}</td>
              <td>{__('Өвдсөн цаг /ХЧТАТ бодох цаг/')}</td>
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
                colSpan={4}
                style={{ textAlign: 'center', border: '1px solid #EEE' }}
              >
                {__('Schedule')}
              </th>
              <th
                colSpan={7}
                style={{ textAlign: 'center', border: '1px solid #EEE' }}
              >
                {__('Performance')}
              </th>
            </tr>
            <tr>
              <td>{__('Team member Id')}</td>
              <td>{__('Last Name')}</td>
              <td>{__('First Name')}</td>
              <td style={{ textAlign: 'left' }}>{__('Position')}</td>
              <td>{__('Date')}</td>
              <td>{__('Planned Check In')}</td>
              <td>{__('Planned Check Out')}</td>
              <td>{__('Planned Duration')}</td>
              <td>{__('Planned Break')}</td>
              <td>{__('Check In')}</td>
              <td>{__('In Device')}</td>
              <td>{__('Check Out')}</td>
              <td>{__('Out Device')}</td>
              <td>{__('Duration')}</td>
              <td>{__('Overtime')}</td>
              <td>{__('Overnight')}</td>
              <td>{__('Mins Late')}</td>
            </tr>
          </>
        );
    }
  };

  const content = () => {
    // custom report for bichil-globus
    const bichilTable = loadDynamicComponent('bichilReportTable', {
      reportType,
      queryParams
    });

    if (bichilTable) {
      return bichilTable;
    }

    return (
      <Table>
        <thead>{renderTableHead()}</thead>
        {reports &&
          reports.map(reportt => (
            <ReportRow
              key={Math.random()}
              reportType={reportType}
              report={reportt}
            />
          ))}
      </Table>
    );
  };

  const renderSelectionBar = () => {
    const onTypeSelect = type => {
      router.setParams(history, { reportType: type.value });
      setType(type.value);
    };

    return (
      <FlexRow>
        <ToggleButton
          id="btn-inbox-channel-visible"
          isActive={isSideBarOpen}
          onClick={onToggleSidebar}
        >
          <Icon icon="subject" />
        </ToggleButton>
        <FilterItem>
          <FormGroup>
            <ControlLabel>Select type</ControlLabel>
            <Select
              value={reportType}
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
      </FlexRow>
    );
  };
  const renderExportBtn = () => {
    const bichilExportReportBtn = loadDynamicComponent(
      'bichilExportReportBtn',
      { queryParams }
    );

    if (bichilExportReportBtn) {
      return bichilExportReportBtn;
    }
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

  getPagination(<Pagination count={totalCount} />);
  showSideBar(isSideBarOpen);
  getActionBar(actionBar);

  return content();
}

export default ReportList;

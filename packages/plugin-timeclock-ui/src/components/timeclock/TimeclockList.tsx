import Button from '@erxes/ui/src/components/Button';
import { ITimeclock } from '../../types';
import Row from './TimeclockRow';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import TimeForm from '../../containers/timeclock/TimeFormList';

type Props = {
  queryParams: any;
  history: any;
  startTime?: Date;
  timeclocks: ITimeclock[];
  startClockTime?: (userId: string) => void;
  loading: boolean;
  getActionBar: (actionBar: any) => void;
  extractAllMySqlData: () => void;
};

function List({
  timeclocks,
  startClockTime,
  getActionBar,
  extractAllMySqlData
}: Props) {
  const trigger = (
    <Button id="btn1" btnStyle={'success'} icon="plus-circle">
      {`Start Shift`}
    </Button>
  );

  const modalContent = props => (
    <TimeForm
      {...props}
      startClockTime={startClockTime}
      timeclocks={timeclocks}
    />
  );

  const actionBarRight = (
    <>
      <Button onClick={extractAllMySqlData}>Extract all data</Button>
      <ModalTrigger
        title={__('Start shift')}
        trigger={trigger}
        content={modalContent}
      />
    </>
  );

  const title = (
    <Title capitalize={true}>
      {__(new Date().toDateString().slice(0, -4))}
    </Title>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={title}
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  const compareUserName = (a, b) => {
    if (a.employeeUserName < b.employeeUserName) {
      return -1;
    }
    if (a.employeeUserName > b.employeeUserName) {
      return 1;
    }
    return 0;
  };

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('Shift date')}</th>
          <th>{__('Shift started')}</th>
          <th>{__('Shift ended')}</th>
          <th>{__('Overnight')}</th>
          <th>{__('Branch / Device name')}</th>
          <th>{__('Device type')}</th>
          <th>{__('Status')}</th>
        </tr>
      </thead>
      <tbody>
        {timeclocks.sort(compareUserName).map(timeclock => {
          return <Row key={timeclock._id} timeclock={timeclock} />;
        })}
      </tbody>
    </Table>
  );

  getActionBar(actionBar);
  return content;
}

export default List;

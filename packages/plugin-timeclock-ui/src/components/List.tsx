import Button from '@erxes/ui/src/components/Button';
import { ITimeclock } from '../types';
import Row from './Row';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState, useEffect } from 'react';
import TimeForm from './TimeForm';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

type Props = {
  currentDate?: string;
  currentUserId: string;
  queryParams: any;
  startTime?: Date;
  timeclocks: ITimeclock[];
  startClockTime: (startTime: Date, currentUserId: string) => void;
  stopClockTime: (
    stopTime: Date,
    currentUserId: string,
    timeId: string
  ) => void;
  loading: boolean;
};

function convertMsToTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  // 👇️ If you don't want to roll hours over, e.g. 24 to 00
  // 👇️ comment (or remove) the line below
  // commenting next line gets you `24:00:00` instead of `00:00:00`
  // or `36:15:31` instead of `12:15:31`, etc.
  hours = hours % 24;

  return `${hours}:${minutes}:${seconds}`;
}

function List({
  timeclocks,
  currentDate,
  startClockTime,
  stopClockTime,
  currentUserId,
  queryParams,
  loading
}: Props) {
  const shiftStarted = localStorage.getItem('shiftStarted') === 'true' || false;
  const [currentTime, setCurrentTime] = useState(new Date());

  // useEffect(() => {
  //   const timer = setInterval(() => setCurrentTime(new Date()), 1000);
  //   return function cleanup() {
  //     clearInterval(timer);
  //   };
  // });

  const trigger = shiftStarted ? (
    <Button id="timeClockButton1" btnStyle="danger" icon="plus-circle">
      End Shift
    </Button>
  ) : (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Start Shift
    </Button>
  );

  const modalContent = props => (
    <TimeForm
      {...props}
      currentUserId={currentUserId}
      startClockTime={startClockTime}
      stopClockTime={stopClockTime}
      timeclocks={timeclocks}
    />
  );
  console.log('jajajjaja', localStorage.getItem('shiftStarted'));
  const actionBarRight = shiftStarted ? (
    <ModalTrigger
      title={__('End shift')}
      trigger={trigger}
      content={modalContent}
    />
  ) : (
    <ModalTrigger
      title={__('Start shift')}
      trigger={trigger}
      content={modalContent}
    />
  );

  let shiftDuration;
  let shiftStartTime;

  if (timeclocks[0]) {
    shiftStartTime = new Date(timeclocks[0].shiftStart);
    const timeDiff = currentTime.getTime() - shiftStartTime.getTime();
    shiftDuration = convertMsToTime(timeDiff);
  }

  const title = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginRight: '20px',
        fontSize: '24px'
      }}
    >
      <Title capitalize={true}>
        {__(new Date().toDateString().slice(0, -4))}
      </Title>
      {shiftDuration}
    </div>
  );

  const actionBar = (
    <Wrapper.ActionBar
      left={title}
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Shift date')}</th>
          <th>{__('Shift started')}</th>
          <th>{__('Shift ended')}</th>
        </tr>
      </thead>
      <tbody id={'TimeclocksShowing'}>
        {timeclocks.map(timeclock => {
          return (
            // <tr key={Math.random()}>{shiftStartTime.toLocaleTimeString()}</tr>
            <Row space={0} key={timeclock._id} timeclock={timeclock} />
          );
        })}
      </tbody>
    </Table>
  );

  const SideBarList = asyncComponent(() =>
    import(
      /* webpackChunkName: "List - Timeclocks" */ '../containers/SideBarList'
    )
  );

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Timeclocks'), link: '/timeclocks' }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Timeclocks')} breadcrumb={breadcrumb} />
      }
      actionBar={actionBar}
      content={
        <DataWithLoader
          data={content}
          loading={loading}
          emptyText={__('Theres no timeclock')}
          emptyImage="/images/actions/8.svg"
        />
      }
      leftSidebar={
        <SideBarList currentDate={currentDate} queryParams={queryParams} />
      }
      transparent={true}
      hasBorder={true}
    />
  );
}

export default List;

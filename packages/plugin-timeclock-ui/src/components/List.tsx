import Button from '@erxes/ui/src/components/Button';
import { ITimeclock } from '../types';
import Row from './Row';
import { menuTimeClock } from '../menu';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import SideBarList from '../containers/SideBarList';
import TimeForm from '../containers/TimeFormList';

type Props = {
  currentDate?: string;
  currentUserId: string;
  queryParams: any;
  history: any;
  startTime?: Date;
  timeclocks: ITimeclock[];
  startClockTime?: (userId: string) => void;
  loading: boolean;
};

function List({
  timeclocks,
  startClockTime,
  currentUserId,
  queryParams,
  history,
  loading
}: Props) {
  const trigger = (
    <Button id="btn1" btnStyle={'success'} icon="plus-circle">
      {`Start Shift`}
    </Button>
  );

  const modalContent = props => (
    <TimeForm
      {...props}
      currentUserId={currentUserId}
      startClockTime={startClockTime}
      timeclocks={timeclocks}
    />
  );

  const actionBarRight = (
    <>
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

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('Shift date')}</th>
          <th>{__('Shift started')}</th>
          <th>{__('Shift ended')}</th>
          <th>{__('Status')}</th>
        </tr>
      </thead>
      <tbody>
        {timeclocks.map(timeclock => {
          return <Row key={timeclock._id} timeclock={timeclock} />;
        })}
      </tbody>
    </Table>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Timeclocks')} submenu={menuTimeClock} />
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
      leftSidebar={<SideBarList queryParams={queryParams} history={history} />}
      transparent={true}
      hasBorder={true}
    />
  );
}

export default List;

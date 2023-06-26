import Button from '@erxes/ui/src/components/Button';
import { ITimeclock } from '../../types';
import Row from './TimeclockRow';
import { Alert, __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import TimeForm from '../../containers/timeclock/TimeFormList';
import { FlexRowLeft, TextAlignCenter, ToggleButton } from '../../styles';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  currentUser: IUser;
  departments: IDepartment[];
  branches: IBranch[];

  queryParams: any;
  history: any;
  startTime?: Date;
  timeclocks: ITimeclock[];
  loading: boolean;
  totalCount: number;

  isCurrentUserAdmin: boolean;

  startClockTime?: (userId: string) => void;
  removeTimeclock: (_id: string) => void;

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

function List(props: Props) {
  const {
    isCurrentUserAdmin,
    currentUser,
    departments,
    branches,
    timeclocks,
    totalCount,
    startClockTime,
    removeTimeclock,
    getActionBar,
    showSideBar,
    getPagination
  } = props;

  const trigger = (
    <Button btnStyle={'success'} icon="plus-circle">
      Start Shift
    </Button>
  );

  const [isSideBarOpen, setIsOpen] = useState(
    localStorage.getItem('isSideBarOpen') === 'true' ? true : false
  );

  const onToggleSidebar = () => {
    const toggleIsOpen = !isSideBarOpen;
    setIsOpen(toggleIsOpen);
    localStorage.setItem('isSideBarOpen', toggleIsOpen.toString());
  };

  const modalContent = contenProps => (
    <TimeForm
      {...contenProps}
      {...props}
      startClockTime={startClockTime}
      timeclocks={timeclocks}
    />
  );

  const actionBarLeft = (
    <FlexRowLeft>
      <ToggleButton
        id="btn-inbox-channel-visible"
        isActive={isSideBarOpen}
        onClick={onToggleSidebar}
      >
        <Icon icon="subject" />
      </ToggleButton>

      <Title capitalize={true}>
        {__(new Date().toDateString().slice(0, -4))}
      </Title>
    </FlexRowLeft>
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

  const actionBar = (
    <Wrapper.ActionBar
      left={actionBarLeft}
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
          <th>{__('Check In')}</th>
          <th>{__('In Device')}</th>
          <th>{__('Location')}</th>
          <th>{__('Check Out')}</th>
          <th>{__('Overnight')}</th>
          <th>{__('Out Device')}</th>
          <th>{__('Location')}</th>
          <th>
            <TextAlignCenter>{__('Action')}</TextAlignCenter>
          </th>
        </tr>
      </thead>
      <tbody>
        {timeclocks.map(timeclock => {
          return (
            <Row
              isCurrentUserAdmin={isCurrentUserAdmin}
              key={timeclock._id}
              timeclock={timeclock}
              removeTimeclock={removeTimeclock}
            />
          );
        })}
      </tbody>
    </Table>
  );

  getActionBar(actionBar);
  showSideBar(isSideBarOpen);
  getPagination(<Pagination count={totalCount} />);

  return content;
}

export default List;

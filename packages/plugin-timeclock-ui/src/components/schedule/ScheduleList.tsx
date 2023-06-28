import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { FlexRowLeft, ToggleButton } from '../../styles';

import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import ScheduleForm from './ScheduleForm';
import { ISchedule, IScheduleConfig, IShift } from '../../types';
import dayjs from 'dayjs';
import {
  dateFormat,
  dateOfTheMonthFormat,
  dayOfTheWeekFormat,
  timeFormat
} from '../../constants';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import { isEnabled, router } from '@erxes/ui/src/utils/core';
import Table from '@erxes/ui/src/components/table';
import { IUser } from '@erxes/ui/src/auth/types';
import Icon from '@erxes/ui/src/components/Icon';
import Select from 'react-select-plus';

type Props = {
  currentUser: IUser;
  isCurrentUserAdmin: boolean;
  isCurrentUserSupervisor?: boolean;

  queryParams: any;
  history: any;

  departments: IDepartment[];
  branches: IBranch[];

  scheduleOfMembers: ISchedule[];
  scheduleConfigs: IScheduleConfig[];
  totalCount: number;

  solveSchedule: (scheduleId: string, status: string) => void;
  solveShift: (shiftId: string, status: string) => void;
  submitRequest: (
    userId: any,
    filledShifts: any,
    totalBreakInMins?: number | string,
    selectedScheduleConfigId?: string
  ) => void;
  submitSchedule: (
    branchIds: any,
    departmentIds: any,
    userIds: any,
    filledShifts: any,
    totalBreakInMins?: number | string,
    selectedScheduleConfigId?: string
  ) => void;
  removeScheduleShifts: (_id: string, type: string) => void;

  checkDuplicateScheduleShifts: (values: any) => any;

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

function ScheduleList(props: Props) {
  const {
    history,
    scheduleOfMembers,
    totalCount,
    queryParams,
    solveSchedule,
    removeScheduleShifts,
    getActionBar,
    showSideBar,
    getPagination,
    isCurrentUserSupervisor
  } = props;

  const [selectedScheduleStatus, setScheduleStatus] = useState(
    router.getParam(history, 'scheduleStatus') || ''
  );
  const [showRemoveBtn, setShowRemoveBtn] = useState(false);

  const [isSideBarOpen, setIsOpen] = useState(
    localStorage.getItem('isSideBarOpen') === 'true' ? true : false
  );

  const onToggleSidebar = () => {
    const toggleIsOpen = !isSideBarOpen;
    setIsOpen(toggleIsOpen);
    localStorage.setItem('isSideBarOpen', toggleIsOpen.toString());
  };

  const { startDate, endDate } = queryParams;
  let lastColumnIdx = 1;

  type Column = {
    columnNo: number;
    dateField: string;
    text: string;
    backgroundColor: string;
    date?: Date;
  };

  const daysAndDatesHeaders: Column[] = [];

  const prepareTableHeaders = () => {
    let startRange = dayjs(startDate);
    const endRange = dayjs(endDate);

    let columnNo = 1;

    while (startRange <= endRange) {
      const backgroundColor =
        startRange.toDate().getDay() === 0 || startRange.toDate().getDay() === 6
          ? '#f4c1bc'
          : 'white';

      daysAndDatesHeaders.push({
        columnNo,
        dateField: startRange.format(dateOfTheMonthFormat),
        text: startRange.format(dateOfTheMonthFormat),
        backgroundColor,
        date: startRange.toDate()
      });

      columnNo += 1;
      startRange = startRange.add(1, 'day');
    }

    lastColumnIdx = columnNo;
  };

  const trigger = (
    <Button btnStyle="success" icon="plus-circle">
      Create Schedule Request - Employee
    </Button>
  );

  const adminConfigTrigger = (
    <Button btnStyle="primary" icon="plus-circle">
      Create Schedule - Admin
    </Button>
  );

  const modalContent = ({ closeModal }) => (
    <ScheduleForm modalContentType={''} closeModal={closeModal} {...props} />
  );

  const adminConfigContent = ({ closeModal }) => {
    return (
      <ScheduleForm
        modalContentType={'adminConfig'}
        closeModal={closeModal}
        {...props}
      />
    );
  };

  const filterSchedules = (schedules: ISchedule[]) => {
    switch (selectedScheduleStatus) {
      case 'Rejected':
        return schedules.filter(
          schedule =>
            schedule.solved &&
            schedule.status?.toLocaleLowerCase() === 'rejected'
        );
      case 'Pending':
        return schedules.filter(schedule => !schedule.solved);
      default:
        return schedules.filter(
          schedule =>
            schedule.solved &&
            schedule.status?.toLocaleLowerCase() === 'approved'
        );
    }
  };

  const onSelectScheduleStatus = e => {
    setScheduleStatus(e.value);
    router.setParams(history, { scheduleStatus: e.value });
  };

  const actionBarLeft = (
    <FlexRowLeft>
      <ToggleButton
        id="btn-inbox-channel-visible"
        isActive={isSideBarOpen}
        onClick={onToggleSidebar}
      >
        <Icon icon="subject" />
      </ToggleButton>
      <div style={{ width: '20%' }}>
        <Select
          value={selectedScheduleStatus}
          onChange={onSelectScheduleStatus}
          placeholder="Select Schedule"
          multi={false}
          options={['Approved', 'Rejected', 'Pending'].map(el => ({
            value: el,
            label: el
          }))}
        />
      </div>
    </FlexRowLeft>
  );

  const actionBarRight = (
    <>
      <ModalTrigger
        title={__('Send schedule request')}
        size="lg"
        trigger={trigger}
        content={modalContent}
      />

      {isCurrentUserSupervisor && (
        <ModalTrigger
          size="lg"
          title={__('Schedule config - Admin')}
          trigger={adminConfigTrigger}
          content={adminConfigContent}
        />
      )}
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

  const removeSchedule = (_id: string, type: string) => {
    removeScheduleShifts(_id, type);
  };

  const renderTableHeaders = () => {
    prepareTableHeaders();
    return (
      <thead>
        <tr>
          <th
            rowSpan={2}
            style={{ border: '1px solid #EEE' }}
            onMouseOver={() => setShowRemoveBtn(true)}
            onMouseLeave={() => setShowRemoveBtn(false)}
          >
            {''}
          </th>
          {selectedScheduleStatus === 'Pending' && (
            <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
              {__('Action')}
            </th>
          )}
          <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
            {__('Team members')}
          </th>

          <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
            {__('Employee Id')}
          </th>
          <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
            {__('Total days')}
          </th>
          <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
            {__('Total hours')}
          </th>
          <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
            {__('Total Break')}
          </th>
          {!isEnabled('bichil') && (
            <th rowSpan={2} style={{ border: '1px solid #EEE' }}>
              {__('Member checked')}
            </th>
          )}
          {daysAndDatesHeaders.map(column => {
            return (
              <th
                key={column.dateField}
                style={{
                  backgroundColor: column.backgroundColor,
                  border: '1px solid #EEE'
                }}
              >
                {dayjs(column.date).format(dayOfTheWeekFormat)}
              </th>
            );
          })}
        </tr>
        <tr>
          {daysAndDatesHeaders.map(column => {
            return (
              <th
                key={column.dateField}
                style={{
                  backgroundColor: column.backgroundColor,
                  border: '1px solid #EEE'
                }}
              >
                {column.text}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  };

  const renderScheduleShifts = (shiftsOfMember: IShift[], userId: string) => {
    type ShiftString = {
      shiftStart: string;
      shiftEnd: string;
      backgroundColor: string;
    };

    const listShiftsOnCorrectColumn: { [columnNo: number]: ShiftString[] } = [];

    for (const shift of shiftsOfMember) {
      const findColumn = daysAndDatesHeaders.find(
        date =>
          date.dateField ===
          dayjs(shift.shiftStart).format(dateOfTheMonthFormat)
      );

      if (findColumn) {
        const columnNumber = findColumn.columnNo;
        const backgroundColor = findColumn.backgroundColor;

        const shiftStart = dayjs(shift.shiftStart).format(timeFormat);
        const shiftEnd = dayjs(shift.shiftEnd).format(timeFormat);

        // if multiple shifts on a single date
        if (columnNumber in listShiftsOnCorrectColumn) {
          const prevShifts = listShiftsOnCorrectColumn[columnNumber];
          listShiftsOnCorrectColumn[columnNumber] = [
            {
              shiftStart,
              shiftEnd,
              backgroundColor
            },
            ...prevShifts
          ];
          continue;
        }

        listShiftsOnCorrectColumn[columnNumber] = [
          { shiftStart, shiftEnd, backgroundColor }
        ];
        continue;
      }
    }

    const listRowOnColumnOrder: any = [];

    for (let i = 1; i < lastColumnIdx; i++) {
      if (i in listShiftsOnCorrectColumn) {
        const shiftsOfDay = listShiftsOnCorrectColumn[i].map(shift => {
          return (
            <td
              key={Math.random()}
              style={{
                backgroundColor: shift.backgroundColor,
                border: '1px solid #EEE'
              }}
            >
              <div>{shift.shiftStart}</div>
              <div>{shift.shiftEnd}</div>
            </td>
          );
        });
        listRowOnColumnOrder.push(...shiftsOfDay);
        continue;
      }

      const findBackgroundColor = daysAndDatesHeaders.find(
        date => date.columnNo === i
      )?.backgroundColor;

      listRowOnColumnOrder.push(
        <td
          style={{
            backgroundColor: '#dddddd',
            border: '1px solid #EEE'
          }}
        />
      );
    }

    return <>{listRowOnColumnOrder}</>;
  };

  const renderScheduleRow = (scheduleOfMember: ISchedule, user: IUser) => {
    const { details, email } = user;

    const name = user && details && details.fullName ? details.fullName : email;

    const employeeId = user && user.employeeId ? user.employeeId : '';

    const scheduleChecked =
      scheduleOfMember.scheduleChecked || !scheduleOfMember.submittedByAdmin
        ? 'checked'
        : '-';

    const totalDaysScheduled = new Set(
      scheduleOfMember.shifts.map(shift =>
        dayjs(shift.shiftStart).format(dateFormat)
      )
    ).size;

    let totalHoursScheduled = 0;
    let totalBreakInMins = 0;

    scheduleOfMember.shifts.map(shift => {
      totalHoursScheduled +=
        (new Date(shift.shiftEnd).getTime() -
          new Date(shift.shiftStart).getTime()) /
        (1000 * 3600);

      totalBreakInMins += shift.lunchBreakInMins || 0;
    });

    const totalBreakInHours = totalBreakInMins / 60;

    if (totalHoursScheduled) {
      totalHoursScheduled -= totalBreakInHours;
    }

    return (
      <tr style={{ textAlign: 'left' }}>
        <td
          onMouseOver={() => setShowRemoveBtn(true)}
          onMouseLeave={() => setShowRemoveBtn(false)}
          style={{ textAlign: 'center' }}
        >
          {showRemoveBtn && (
            <Tip text={'Remove Schedule'} placement="top">
              <Button
                size="small"
                icon="times-circle"
                btnStyle="link"
                onClick={() => removeSchedule(scheduleOfMember._id, 'schedule')}
              />
            </Tip>
          )}
        </td>

        {selectedScheduleStatus === 'Pending' && (
          <td>
            <Button
              disabled={scheduleOfMember.solved}
              size="small"
              btnStyle="success"
              onClick={() => solveSchedule(scheduleOfMember._id, 'Approved')}
            >
              Approve
            </Button>
            <Button
              disabled={scheduleOfMember.solved}
              size="small"
              btnStyle="danger"
              onClick={() => solveSchedule(scheduleOfMember._id, 'Rejected')}
            >
              Reject
            </Button>
          </td>
        )}
        <td>{name}</td>
        <td>{employeeId}</td>
        <td>{totalDaysScheduled}</td>
        <td>{totalHoursScheduled.toFixed(1)}</td>
        <td>{totalBreakInHours.toFixed(1)}</td>
        {!isEnabled('bichil') && <td>{scheduleChecked}</td>}
        {renderScheduleShifts(scheduleOfMember.shifts, user._id)}
      </tr>
    );
  };

  getActionBar(actionBar);
  showSideBar(isSideBarOpen);
  getPagination(<Pagination count={totalCount} />);

  const content = () => {
    const getFilteredSchedules = filterSchedules(scheduleOfMembers);

    return (
      <Table bordered={true} condensed={true} responsive={true}>
        {renderTableHeaders()}
        {getFilteredSchedules.map(schedule => {
          return renderScheduleRow(schedule, schedule.user);
        })}
        <tbody>{}</tbody>
      </Table>
    );
  };
  return content();
}

export default ScheduleList;

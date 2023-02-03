import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import { CustomRow } from '../../styles';

import { IBranch } from '@erxes/ui/src/team/types';
import Tip from '@erxes/ui/src/components/Tip';
import ScheduleForm from './ScheduleForm';
import { IScheduleConfig } from '../../types';
import dayjs from 'dayjs';
import { dateFormat } from '../../constants';

type Props = {
  scheduleOfMembers: any;
  queryParams: any;
  history: any;
  branchesList: IBranch[];
  scheduleConfigs: IScheduleConfig[];
  getActionBar: (actionBar: any) => void;
  solveSchedule: (scheduleId: string, status: string) => void;
  solveShift: (shiftId: string, status: string) => void;
  submitRequest: (
    userId: any,
    filledShifts: any,
    selectedScheduleConfigId?: string
  ) => void;
  submitSchedule: (
    branchIds: any,
    departmentIds: any,
    userIds: any,
    filledShifts: any,
    selectedScheduleConfigId?: string
  ) => void;
  removeScheduleShifts: (_id: string, type: string) => void;
};

function ScheduleList(props: Props) {
  const {
    scheduleOfMembers,
    solveSchedule,
    solveShift,
    getActionBar,
    removeScheduleShifts
  } = props;

  const trigger = (
    <Button btnStyle="success" icon="plus-circle">
      Create Request - Per Employee
    </Button>
  );

  const adminTrigger = (
    <Button btnStyle="success" icon="plus-circle">
      Create Request - Admin
    </Button>
  );

  const adminConfigTrigger = (
    <Button btnStyle="primary" icon="plus-circle">
      Schedule Configuration - Admin
    </Button>
  );

  const modalContent = ({ closeModal }) => (
    <ScheduleForm modalContentType={''} closeModal={closeModal} {...props} />
  );

  const adminModalContent = ({ closeModal }) => (
    <ScheduleForm
      modalContentType={'admin'}
      closeModal={closeModal}
      {...props}
    />
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

  const actionBarRight = (
    <>
      <ModalTrigger
        title={__('Send schedule request')}
        trigger={trigger}
        content={modalContent}
      />
      <ModalTrigger
        title={__('Create schedule - Admin')}
        trigger={adminTrigger}
        content={adminModalContent}
      />
      <ModalTrigger
        size="lg"
        title={__('Schedule config - Admin')}
        trigger={adminConfigTrigger}
        content={adminConfigContent}
      />
    </>
  );

  const actionBar = (
    <Wrapper.ActionBar
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  const removeSchedule = (_id: string, type: string) => {
    removeScheduleShifts(_id, type);
  };

  const ListShiftContent = shifts => {
    return (
      <>
        <td>
          {shifts.map(shift => {
            return (
              <CustomRow key={shift.shiftEnd} marginNum={10}>
                {new Date(shift.shiftStart).toDateString().split(' ')[0] +
                  '\t' +
                  dayjs(shift.shiftStart).format(dateFormat)}
              </CustomRow>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return (
              <CustomRow key={shift.shiftEnd} marginNum={10}>
                {new Date(shift.shiftStart).toLocaleTimeString()}
              </CustomRow>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return (
              <CustomRow key={shift.shiftEnd} marginNum={10}>
                {new Date(shift.shiftEnd).toLocaleTimeString()}
              </CustomRow>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return (
              <CustomRow key={shift.shiftEnd} marginNum={10}>
                {new Date(shift.shiftEnd).toLocaleDateString() !==
                new Date(shift.shiftStart).toLocaleDateString()
                  ? 'O'
                  : '-'}
              </CustomRow>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return shift.solved ? (
              <CustomRow marginNum={10}>{__(shift.status)}</CustomRow>
            ) : (
              <CustomRow marginNum={3}>
                <Button
                  size="small"
                  btnStyle="success"
                  onClick={() => solveShift(shift._id, 'Approved')}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  btnStyle="danger"
                  onClick={() => solveShift(shift._id, 'Rejected')}
                >
                  Reject
                </Button>
              </CustomRow>
            );
          })}
        </td>
        <td>
          {shifts.map(shift => {
            return (
              <CustomRow marginNum={4} key={shift._id}>
                <Button
                  size="small"
                  btnStyle="link"
                  onClick={() => removeSchedule(shift._id, 'shift')}
                  icon="times-circle"
                />
              </CustomRow>
            );
          })}
        </td>
      </>
    );
  };
  const ListScheduleContent = schedule => {
    return schedule.shifts.length ? (
      <tr>
        <td>
          {schedule.user &&
          schedule.user.details &&
          schedule.user.details.fullName
            ? schedule.user.details.fullName
            : schedule.user.email}
        </td>
        <td>
          {schedule.solved ? (
            __(schedule.status)
          ) : (
            <>
              <Button
                disabled={schedule.solved}
                btnStyle="success"
                onClick={() => solveSchedule(schedule._id, 'Approved')}
              >
                Approve
              </Button>
              <Button
                btnStyle="danger"
                onClick={() => solveSchedule(schedule._id, 'Rejected')}
              >
                Reject
              </Button>
            </>
          )}
        </td>
        <td>
          <Tip text={__('Delete')} placement="top">
            <Button
              btnStyle="link"
              onClick={() => removeSchedule(schedule._id, '')}
              icon="times-circle"
            />
          </Tip>
        </td>
        {ListShiftContent(schedule.shifts)}
      </tr>
    ) : (
      <></>
    );
  };

  const content = (
    <Table>
      <thead>
        <tr>
          <th>{__('Team member')}</th>
          <th>{__('Schedule status')}</th>
          <th>&nbsp;</th>
          <th>{__('Shift date')}</th>
          <th>{__('Shift start')}</th>
          <th>{__('Shift end')}</th>
          <th>{__('Overnight')}</th>
          <th>{__('Shift Status')}</th>
          <th>{__('Action')}</th>
        </tr>
      </thead>
      <tbody>
        {scheduleOfMembers &&
          scheduleOfMembers.map(memberSchedule => {
            return ListScheduleContent(memberSchedule);
          })}
      </tbody>
    </Table>
  );

  getActionBar(actionBar);
  return content;
}

export default ScheduleList;

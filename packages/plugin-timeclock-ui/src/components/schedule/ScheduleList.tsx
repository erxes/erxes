import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { CustomRow, Margin, RowField } from '../../styles';

import { IBranch } from '@erxes/ui/src/team/types';
import Tip from '@erxes/ui/src/components/Tip';
import ScheduleForm from './ScheduleForm';
import { IScheduleConfig } from '../../types';
import dayjs from 'dayjs';
import { dateFormat, timeFormat } from '../../constants';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import SortableList from '@erxes/ui/src/components/SortableList';
import {
  CollapseRow,
  DropIcon,
  PropertyListTable,
  PropertyTableHeader,
  PropertyTableRow
} from '@erxes/ui-forms/src/settings/properties/styles';
import Collapse from 'react-bootstrap/Collapse';
import ControlLabel from '@erxes/ui/src/components/form/Label';

type Props = {
  scheduleOfMembers: any;
  queryParams: any;
  history: any;
  branchesList: IBranch[];
  scheduleConfigs: IScheduleConfig[];
  totalCount: number;
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

  getActionBar: (actionBar: any) => void;
  showSideBar: (sideBar: boolean) => void;
  getPagination: (pagination: any) => void;
};

function ScheduleList(props: Props) {
  const {
    scheduleOfMembers,
    totalCount,
    solveSchedule,
    solveShift,
    removeScheduleShifts,
    getActionBar,
    showSideBar,
    getPagination
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
    return shifts.map(shift => (
      <PropertyTableRow key="">
        <RowField>
          <CustomRow key={shift.shiftEnd} marginNum={10}>
            {new Date(shift.shiftStart).toDateString().split(' ')[0] +
              '\t' +
              dayjs(shift.shiftStart).format(dateFormat)}
          </CustomRow>
        </RowField>
        <RowField>
          <CustomRow key={shift.shiftEnd} marginNum={10}>
            {dayjs(shift.shiftStart).format(timeFormat)}
          </CustomRow>
        </RowField>
        <RowField>
          <CustomRow key={shift.shiftEnd} marginNum={10}>
            {dayjs(shift.shiftEnd).format(timeFormat)}
          </CustomRow>
        </RowField>
        <RowField>
          <CustomRow key={shift.shiftEnd} marginNum={10}>
            {new Date(shift.shiftEnd).toLocaleDateString() !==
            new Date(shift.shiftStart).toLocaleDateString()
              ? 'O'
              : '-'}
          </CustomRow>
        </RowField>
        <RowField>
          {shift.solved ? (
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
          )}
        </RowField>
        <RowField>
          <CustomRow marginNum={4} key={shift._id}>
            <Button
              size="small"
              btnStyle="link"
              onClick={() => removeSchedule(shift._id, 'shift')}
              icon="times-circle"
            />
          </CustomRow>
        </RowField>
      </PropertyTableRow>
    ));
  };

  const content = schedule => {
    const [collapse, setCollapse] = useState(false);
    const { details, email } = schedule.user;

    const handleCollapse = () => {
      setCollapse(!collapse);
    };

    const name =
      schedule.user && details && details.fullName ? details.fullName : email;

    const status = schedule.solved ? (
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
    );

    if (schedule.shifts.length > 0) {
      return (
        <div key={schedule._id} style={{ flex: 1 }}>
          <CollapseRow isChild={false}>
            <div style={{ flex: 1 }} onClick={handleCollapse}>
              <DropIcon isOpen={collapse} />
              {name}
            </div>
            {status}
            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={() => removeSchedule(schedule._id, '')}
                icon="times-circle"
              />
            </Tip>
          </CollapseRow>
          <Collapse in={collapse}>
            <Margin>
              <PropertyListTable>
                <PropertyTableHeader>
                  <ControlLabel>
                    <b>{__('Shift date')}</b>
                  </ControlLabel>
                  <ControlLabel>{__('Shift start')}</ControlLabel>
                  <ControlLabel>{__('Shift end')}</ControlLabel>
                  <ControlLabel>{__('Overnight')}</ControlLabel>
                  <ControlLabel>{__('Shift Status')}</ControlLabel>
                  <ControlLabel>{__('Actions')}</ControlLabel>
                </PropertyTableHeader>
                {ListShiftContent(schedule.shifts)}
              </PropertyListTable>
            </Margin>
          </Collapse>
        </div>
      );
    }

    return null;
  };

  getActionBar(actionBar);
  showSideBar(true);
  getPagination(<Pagination count={totalCount} />);

  return (
    <SortableList
      fields={scheduleOfMembers}
      child={schedule => content(schedule)}
      onChangeFields={() => ''}
      isModal={true}
      showDragHandler={false}
      droppableId="schedule"
      isDragDisabled={true}
    />
  );
}

export default ScheduleList;

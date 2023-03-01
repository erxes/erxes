import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import React from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import { IAbsence, IAbsenceType } from '../../types';
import { IAttachment } from '@erxes/ui/src/types';
import AbsenceForm from './AbsenceForm';
import Attachment from '@erxes/ui/src/components/Attachment';
import dayjs from 'dayjs';
import { dateFormat, timeFormat } from '../../constants';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';

type Props = {
  absences: IAbsence[];
  absenceTypes: IAbsenceType[];
  queryParams: any;
  history: any;
  startTime?: Date;
  loading?: boolean;
  totalCount: number;

  solveAbsence: (absenceId: string, status: string) => void;
  submitRequest: (
    userId: string,
    reason: string,
    explanation: string,
    attachment: IAttachment,
    dateRange: any,
    absenceTypeId: string
  ) => void;

  submitCheckInOut: (type: string, userId: string, dateVal: Date) => void;

  getActionBar: (actionBar: any) => void;
  getPagination: (pagination: any) => void;
  showSideBar: (sideBar: boolean) => void;
};

function AbsenceList(props: Props) {
  const {
    absences,
    solveAbsence,
    getActionBar,
    showSideBar,
    getPagination,
    totalCount
  } = props;

  const trigger = (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Create Request
    </Button>
  );

  const checkInTrigger = (
    <Button id="timeClockButton2" btnStyle="primary" icon="plus-circle">
      Create Check In/Out Request
    </Button>
  );
  const modalContent = contentProps => {
    const updatedProps = {
      ...props,
      contentProps
    };
    return <AbsenceForm {...updatedProps} />;
  };

  const checkInModalContent = contentProps => {
    const updatedProps = {
      ...props,
      checkInOutRequest: true,
      contentProps
    };
    return <AbsenceForm {...updatedProps} />;
  };

  const actionBarRight = (
    <>
      <ModalTrigger
        title={__('Create Request')}
        trigger={trigger}
        content={modalContent}
      />

      <ModalTrigger
        title={__('Create Check In/Out Request')}
        trigger={checkInTrigger}
        content={checkInModalContent}
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

  const ListAbsenceContent = absence => {
    const startTime = new Date(absence.startTime);
    const endTime = new Date(absence.endTime);

    const startingDate =
      new Date(startTime).toDateString().split(' ')[0] +
      '\t' +
      dayjs(startTime).format(dateFormat);
    const startingTime = dayjs(startTime).format(timeFormat);

    const endingDate =
      new Date(endTime).toDateString().split(' ')[0] +
      '\t' +
      dayjs(endTime).format(dateFormat);
    const endingTime = dayjs(endTime).format(timeFormat);

    return (
      <tr>
        <td>
          {absence.user
            ? absence.user.details.fullName
              ? absence.user.details.fullName
              : absence.user.email
              ? absence.user.email
              : '-'
            : '-'}
        </td>
        <td>{absence.startTime ? startingDate : '-'}</td>
        <td>{absence.startTime ? startingTime : '-'}</td>
        <td>{absence.endTime ? endingDate : '-'}</td>
        <td>{absence.endTime ? endingTime : '-'}</td>
        <td>{absence.reason || '-'}</td>
        <td>{absence.explanation || '-'}</td>
        <td>
          {absence.attachment ? (
            <Attachment attachment={absence.attachment} />
          ) : (
            '-'
          )}
        </td>
        <td>
          {absence.solved ? (
            __(absence.status)
          ) : (
            <>
              <Button
                btnStyle="success"
                onClick={() => solveAbsence(absence._id, 'Approved')}
              >
                Approve
              </Button>
              <Button
                btnStyle="danger"
                onClick={() => solveAbsence(absence._id, 'Rejected')}
              >
                Reject
              </Button>
            </>
          )}
        </td>
      </tr>
    );
  };

  const content = (
    <Table>
      <thead>
        <tr>
          <th rowSpan={2}>{__('Team member')}</th>
          <th colSpan={2}>{__('From')}</th>
          <th colSpan={2}>{__('To')}</th>
          <th rowSpan={2}>{__('Reason')}</th>
          <th rowSpan={2}>{__('Explanation')}</th>
          <th rowSpan={2}>{__('Attachment')}</th>
          <th rowSpan={2}>{__('Status')}</th>
        </tr>
      </thead>
      <tbody>
        {absences.map(absence => {
          return ListAbsenceContent(absence);
        })}
      </tbody>
    </Table>
  );

  getActionBar(actionBar);
  showSideBar(true);
  getPagination(<Pagination count={totalCount} />);

  return content;
}

export default AbsenceList;

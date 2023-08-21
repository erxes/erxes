import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import React, { useState } from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import { IAbsence, IAbsenceType } from '../../types';
import { IAttachment } from '@erxes/ui/src/types';
import AbsenceForm from './AbsenceForm';
import Attachment from '@erxes/ui/src/components/Attachment';
import dayjs from 'dayjs';
import { dateAndTimeFormat, dateFormat, timeFormat } from '../../constants';
import Pagination from '@erxes/ui/src/components/pagination/Pagination';
import CheckInOutForm from '../../containers/absence/CheckInOutForm';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import { IUser } from '@erxes/ui/src/auth/types';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { FlexRowLeft, ToggleButton } from '../../styles';

type Props = {
  currentUser: IUser;
  departments: IDepartment[];
  branches: IBranch[];

  absences: IAbsence[];
  absenceTypes: IAbsenceType[];
  queryParams: any;
  history: any;
  startTime?: Date;
  loading?: boolean;
  totalCount: number;

  isCurrentUserAdmin: boolean;

  solveAbsence: (absenceId: string, status: string) => void;
  submitRequest: (
    userId: string,
    reason: string,
    explanation: string,
    attachment: IAttachment,
    submitTime: any,
    absenceTypeId: string,
    absenceTimeType: string,
    totalHoursOfAbsence: string
  ) => void;

  submitCheckInOut: (type: string, userId: string, dateVal: Date) => void;
  removeAbsence: (absenceId: string) => void;

  getActionBar: (actionBar: any) => void;
  getPagination: (pagination: any) => void;
  showSideBar: (sideBar: boolean) => void;
};
function AbsenceList(props: Props) {
  const {
    absences,
    solveAbsence,
    removeAbsence,
    getActionBar,
    showSideBar,
    getPagination,
    totalCount
  } = props;

  const [isSideBarOpen, setIsOpen] = useState(
    localStorage.getItem('isSideBarOpen') === 'true' ? true : false
  );

  const [seeDates, setSeeDates] = useState(
    JSON.parse(localStorage.getItem('seeDates') || 'false')
  );

  const onToggleSidebar = () => {
    const toggleIsOpen = !isSideBarOpen;
    setIsOpen(toggleIsOpen);
    localStorage.setItem('isSideBarOpen', toggleIsOpen.toString());
  };

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
      contentProps,
      checkInOutRequest: true
    };
    return <AbsenceForm {...updatedProps} />;
  };

  const checkInOutFormBtn = <Button btnStyle="primary">Approve</Button>;

  const openCheckInOutForm = (
    contentProps: any,
    absence: IAbsence,
    absenceReason: string
  ) => {
    const dateTime = absence.startTime;
    const userId = absence.user._id;

    const startDate = dayjs(dateTime)
      .add(-16, 'hour')
      .format(dateAndTimeFormat);
    const endDate = dayjs(dateTime)
      .add(16, 'hour')
      .format(dateAndTimeFormat);

    // either check in or check out
    const timeType = absenceReason.split('request')[0].toLocaleLowerCase();

    return (
      <CheckInOutForm
        userId={userId}
        timeType={timeType}
        contentProps={contentProps}
        startDate={startDate}
        endDate={endDate}
        absenceRequest={absence}
      />
    );
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
    </FlexRowLeft>
  );

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
      left={actionBarLeft}
      right={actionBarRight}
      hasFlex={true}
      wideSpacing={true}
    />
  );

  const toggleSeeDates = () => {
    localStorage.setItem('seeDates', JSON.stringify(!seeDates));
    setSeeDates(!seeDates);
  };

  const ListAbsenceContent = (absence: IAbsence) => {
    const startTime = new Date(absence.startTime);
    const endTime = new Date(absence.endTime);

    const startingDate = dayjs(startTime).format(dateFormat);
    const startingTime = dayjs(startTime).format(timeFormat);

    const endingDate = dayjs(endTime).format(dateFormat);
    const endingTime = dayjs(endTime).format(timeFormat);

    const absenceTimeType = absence.absenceTimeType;

    const calculateAbsenceHours = () => {
      // if check in request or request time type is by day
      if (
        absence.reason.match(/Check in request/gi) ||
        absence.reason.match(/Check out request/gi) ||
        absenceTimeType === 'by day'
      ) {
        return '-';
      }

      const getTimeInHours = (
        (endTime.getTime() - startTime.getTime()) /
        3600000
      ).toFixed(1);
      return getTimeInHours;
    };

    const renderAbsenceDays = () => {
      if (absenceTimeType === 'by day' && seeDates) {
        return absence.requestDates.map(requestDate => (
          <div key={requestDate}>{requestDate}</div>
        ));
      }

      return <div>{'-'}</div>;
    };

    const renderAbsenceTimeInfo = () => {
      if (absence.reason.match(/Check in request/gi)) {
        return (
          <>
            <td>{startingDate}</td>
            <td>{startingTime}</td>
            <td>{'-'}</td>
          </>
        );
      }
      if (absence.reason.match(/Check out request/gi)) {
        return (
          <>
            <td>{startingDate}</td>
            <td>{'-'}</td>
            <td>{startingTime}</td>
          </>
        );
      }

      if (absenceTimeType === 'by day') {
        return (
          <>
            <td>{'-'}</td>
            <td>{startingDate}</td>
            <td>{endingDate}</td>
          </>
        );
      }
      // by hour
      return (
        <>
          <td>{startingDate}</td>
          <td>{startingTime}</td>
          <td>{endingTime}</td>
        </>
      );
    };

    return (
      <tr>
        <td>
          {absence.user && absence.user.details
            ? absence.user.details.fullName
              ? absence.user.details.fullName
              : absence.user.email
              ? absence.user.email
              : '-'
            : '-'}
        </td>
        {renderAbsenceTimeInfo()}
        <td>{absence.totalHoursOfAbsence || calculateAbsenceHours()}</td>
        <td>{renderAbsenceDays()}</td>
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
          ) : absence.reason.toLowerCase().includes('check') ? (
            <>
              <ModalTrigger
                size="lg"
                title="Approve Request"
                trigger={checkInOutFormBtn}
                content={contentProps =>
                  openCheckInOutForm(contentProps, absence, absence.reason)
                }
              />

              <Button
                btnStyle="danger"
                onClick={() => solveAbsence(absence._id, 'Rejected')}
              >
                Reject
              </Button>
            </>
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
        <td>
          <Tip text={__('Delete')} placement="top">
            <Button
              btnStyle="link"
              onClick={() => removeAbsence(absence._id)}
              icon="times-circle"
            />
          </Tip>
        </td>
      </tr>
    );
  };

  const content = (
    <Table>
      <thead>
        <tr>
          <th rowSpan={2}>{__('Team member')}</th>
          <th>{__('Date')}</th>
          <th>{__('From')}</th>
          <th>{__('To')}</th>
          <th>{__('Total hours ')}</th>
          <th onClick={toggleSeeDates} style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', flex: 'row', alignItems: 'center' }}>
              <div>{__('See dates')}</div>
              <Icon icon={seeDates ? 'angle-down' : 'angle-right'} size={16} />
            </div>
          </th>
          <th rowSpan={2}>{__('Reason')}</th>
          <th rowSpan={2}>{__('Explanation')}</th>
          <th rowSpan={2}>{__('Attachment')}</th>
          <th rowSpan={2}>{__('Status')}</th>
          <th rowSpan={2}>{__('Action')}</th>
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
  showSideBar(isSideBarOpen);
  getPagination(<Pagination count={totalCount} />);

  return content;
}

export default AbsenceList;

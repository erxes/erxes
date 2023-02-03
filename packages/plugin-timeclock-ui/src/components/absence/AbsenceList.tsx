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
import { dateFormat } from '../../constants';

type Props = {
  absences: IAbsence[];
  absenceTypes: IAbsenceType[];
  queryParams: any;
  history: any;
  startTime?: Date;
  loading?: boolean;
  solveAbsence: (absenceId: string, status: string) => void;
  submitRequest: (
    userId: string,
    explanation: string,
    attachment: IAttachment,
    dateRange: any,
    absenceTypeId: string
  ) => void;
  getActionBar: (actionBar: any) => void;
};

function AbsenceList(props: Props) {
  const { absences, solveAbsence, getActionBar } = props;

  const trigger = (
    <Button id="timeClockButton2" btnStyle="success" icon="plus-circle">
      Create Request
    </Button>
  );

  const modalContent = contentProps => {
    const updatedProps = {
      ...props,
      contentProps
    };
    return <AbsenceForm {...updatedProps} />;
  };

  const actionBarRight = (
    <ModalTrigger
      title={__('Absence Config')}
      trigger={trigger}
      content={modalContent}
    />
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

    const startingTime = startTime.toLocaleTimeString();
    const endingDate =
      new Date(endTime).toDateString().split(' ')[0] +
      '\t' +
      dayjs(endTime).format(dateFormat);
    const endingTime = endTime.toLocaleTimeString();

    return (
      <tr>
        <td>
          {absence.user && absence.user.details.fullName
            ? absence.user.details.fullName
            : absence.user.email}
        </td>
        <td>{startingTime + ', ' + startingDate || '-'}</td>
        <td>{endingTime + ', ' + endingDate || '-'}</td>
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
          <th>{__('Team member')}</th>
          <th>{__('From')}</th>
          <th>{__('To')}</th>
          <th>{__('Reason')}</th>
          <th>{__('Explanation')}</th>
          <th>{__('Attachment')}</th>
          <th>{__('Status')}</th>
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
  return content;
}

export default AbsenceList;

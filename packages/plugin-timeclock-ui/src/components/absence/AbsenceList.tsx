import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import React from 'react';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import Table from '@erxes/ui/src/components/table';
import { IAbsence, IAbsenceType } from '../../types';
import NameCard from '@erxes/ui/src/components/nameCard/NameCard';
import { IAttachment } from '@erxes/ui/src/types';
import AbsenceForm from './AbsenceForm';
import Attachment from '@erxes/ui/src/components/Attachment';

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
    dateRange: any
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
    const startingDate = startTime.toDateString();
    const startingTime = startTime.toLocaleTimeString();
    const endingDate = endTime.toDateString();
    const endingTime = endTime.toLocaleTimeString();

    return (
      <tr>
        <td>{<NameCard user={absence.user} /> || '-'}</td>
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

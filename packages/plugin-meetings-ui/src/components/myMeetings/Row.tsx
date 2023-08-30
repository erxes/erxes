import { Button, Icon, ModalTrigger, Tip } from '@erxes/ui/src/components';
import React from 'react';
import { IMeeting } from '../../types';

type Props = {
  meeting: IMeeting;
};
export const Row = (props: Props) => {
  const { meeting } = props;

  const editMeetingTrigger = () => (
    <Button btnStyle="link">
      <Icon icon="edit-3" />
    </Button>
  );

  return (
    <tr>
      <td>{meeting.title}</td>
      <td>{meeting.createdUser?.username || ''}</td>
      <td>{meeting.createdAt}</td>
      <td>{meeting.participantIds}</td>
      <td>
        <div style={{ textAlign: 'center' }}>
          <ModalTrigger
            size="lg"
            title="Edit meeting"
            trigger={editMeetingTrigger()}
            content={contentProps => <p>a</p>}
          />
          <Tip text={'Delete'} placement="top">
            <Button btnStyle="link" onClick={() => {}} icon="times-circle" />
          </Tip>
        </div>
      </td>
    </tr>
  );
};

import { Button, Icon, ModalTrigger, Tip } from '@erxes/ui/src/components';
import { MemberAvatars } from '@erxes/ui/src/components/';
import { FlexCenter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { IMeeting } from '../../types';
'@erxes/ui/src/components/MemberAvatars';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Form from '../../containers/myCalendar/meeting/Form';
import { useHistory } from 'react-router-dom';
type Props = {
  meeting: IMeeting;
  remove: () => void;
};
export const Row = (props: Props) => {
  const { meeting, remove } = props;
  const history = useHistory();

  const editTrigger = (
    <Button btnStyle="link">
      <Tip text={'Edit'} placement="top">
        <Icon icon="edit-3" />
      </Tip>
    </Button>
  );

  const renderRemoveButton = onClick => {
    return (
      <Tip text={'Delete'} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  };

  const content = props => (
    <Form {...props} meeting={meeting} refetch={['meetings']} />
  );

  const onTrClick = () => {
    history.push(`/meetings/myCalendar?meetingId=${meeting._id}`);
  };

  const onClick = e => {
    e.stopPropagation();
  };

  return (
    <tr onClick={onTrClick}>
      <td>{meeting.title}</td>
      <td>{meeting.createdUser?.username || ''}</td>
      <td>{meeting.createdAt}</td>
      <td>
        <FlexCenter>
          <MemberAvatars
            selectedMemberIds={meeting.participantIds}
            allMembers={meeting.participantUser}
          />
        </FlexCenter>
      </td>
      <td>{meeting.status}</td>
      <td onClick={onClick}>
        <ActionButtons>
          <ModalTrigger
            title="Edit meeting"
            trigger={editTrigger}
            content={content}
          />
          {renderRemoveButton(remove)}
        </ActionButtons>
      </td>
    </tr>
  );
};

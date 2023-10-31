import React, { useState } from 'react';
// erxes
import Button from '@erxes/ui/src/components/Button';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

type Props = {
  chatId: string;
  closeModal: () => void;
  addOrRemoveMember: (userIds: string[]) => void;
  participantUserIds?: string[];
};

const AddMember = (props: Props) => {
  const { participantUserIds } = props;
  const [userIds, setUserIds] = useState<any>([]);

  const handleSubmit = () => {
    props.addOrRemoveMember(userIds);
    props.closeModal();

    setUserIds([]);
  };
  return (
    <>
      <SelectTeamMembers
        label={'Choose team member'}
        name="assignedUserId"
        initialValue={participantUserIds}
        onSelect={value => setUserIds(value)}
      />
      <br />
      <Button style={{ float: 'right' }} onClick={handleSubmit}>
        Add
      </Button>
      <Button
        btnStyle="simple"
        style={{ float: 'right', marginRight: '10px' }}
        onClick={props.closeModal}
      >
        Cancel
      </Button>
    </>
  );
};

export default AddMember;

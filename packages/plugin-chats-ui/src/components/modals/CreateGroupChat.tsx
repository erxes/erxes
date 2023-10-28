import React, { useState } from 'react';
// erxes
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import * as router from '@erxes/ui/src/utils/router';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { useHistory } from 'react-router-dom';

type Props = {
  closeModal: () => void;
  startGroupChat: (name: string) => void;
  userIds: string[];
  setUserIds: (ids: string[]) => void;
};

const CreateGroupChat = (props: Props) => {
  const { userIds, setUserIds } = props;
  const history = useHistory();

  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (userIds.length === 1) {
      router.removeParams(history, 'id', 'userIds');
      router.setParams(history, { userId: userIds });

      setUserIds([]);
      props.closeModal();
    }
    if (userIds.length > 1) {
      props.startGroupChat(name);
      router.removeParams(history, 'userIds');
      router.removeParams(history, 'limit');

      setName('');
    }
  };

  const handleUserChange = _userIds => {
    setUserIds(_userIds);
  };

  return (
    <>
      {userIds.length > 1 && (
        <>
          <FormControl
            placeholder="Write a group chat name"
            value={name}
            onChange={(e: any) => setName(e.target.value)}
          />
          <br />
        </>
      )}
      <SelectTeamMembers
        label={'Choose team member'}
        name="assignedUserIds"
        initialValue={userIds}
        onSelect={handleUserChange}
      />
      <ModalFooter>
        <Button
          btnStyle="success"
          style={{ float: 'right' }}
          onClick={handleSubmit}
        >
          Create
        </Button>
        <Button
          btnStyle="simple"
          style={{ float: 'right', marginRight: '10px' }}
          onClick={props.closeModal}
        >
          Cancel
        </Button>
      </ModalFooter>
    </>
  );
};

export default CreateGroupChat;

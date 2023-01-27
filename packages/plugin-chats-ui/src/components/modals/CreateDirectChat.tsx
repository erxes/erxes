import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
// erxes
import Button from '@erxes/ui/src/components/Button';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import * as router from '@erxes/ui/src/utils/router';

type Props = {
  closeModal: () => void;
};

const CreateDirectChat = (props: Props) => {
  const history = useHistory();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const [userId, setUserId] = useState(queryParams.userId || '');

  const handleSubmit = () => {
    router.removeParams(history, 'id', 'userIds');
    router.setParams(history, { userId: userId });

    setUserId('');
    props.closeModal();
  };

  return (
    <>
      <h3>Direct chat</h3>
      <SelectTeamMembers
        label={'Choose team member'}
        name="assignedUserId"
        initialValue={userId}
        onSelect={value => setUserId(value)}
        multi={false}
      />
      <br />
      <Button style={{ float: 'right' }} onClick={handleSubmit}>
        Compose
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

export default CreateDirectChat;

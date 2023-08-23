import React, { useState } from 'react';
// erxes
import Button from '@erxes/ui/src/components/Button';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import FormControl from '@erxes/ui/src/components/form/Control';

type Props = {
  chat: any;
  closeModal: () => void;
  edit: (id: string, groupChatName: string) => void;
};

const GroupChatName = (props: Props) => {
  const { chat, edit } = props;

  const [name, setName] = useState(chat.name || '');

  const handleSubmit = () => {
    edit(chat._id, name);
  };

  return (
    <>
      <h3>Direct chat</h3>
      <FormControl
        placeholder="Name"
        value={name}
        onChange={(e: any) => setName(e.target.value)}
      />
      <br />
      <Button style={{ float: 'right' }} onClick={handleSubmit}>
        Save
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

export default GroupChatName;

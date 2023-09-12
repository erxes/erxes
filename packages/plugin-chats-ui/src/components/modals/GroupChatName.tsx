import React, { useState } from 'react';
// erxes
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import { ModalFooter } from '@erxes/ui/src/styles/main';

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
      <FormControl
        placeholder="Name"
        value={name}
        onChange={(e: any) => setName(e.target.value)}
      />
      <ModalFooter>
        <Button btnStyle="success" onClick={handleSubmit}>
          Save
        </Button>
        <Button btnStyle="simple" onClick={props.closeModal}>
          Cancel
        </Button>
      </ModalFooter>
    </>
  );
};

export default GroupChatName;

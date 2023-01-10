import React from 'react';
// local
import CreateDirectChat from '../components/CreateDirectChat';

type Props = {
  closeModal: () => void;
};

const CreateDirectChatContainer = (props: Props) => {
  return <CreateDirectChat {...props} />;
};

export default CreateDirectChatContainer;

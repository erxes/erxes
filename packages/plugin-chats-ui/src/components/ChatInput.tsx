import React, { useState } from 'react';
// erxes
import Icon from '@erxes/ui/src/components/Icon';
import EditorCK from '@erxes/ui/src/components/EditorCK';
// local
import { ChatForm, ChatReplyInfo } from '../styles';

type Props = {
  reply?: any;
  setReply: (message: any) => void;
  sendMessage: (message: string) => void;
};

const ChatInput = (props: Props) => {
  const { reply } = props;
  const [message, setMessage] = useState<string>('');

  const handleSendMessage = () => {
    props.sendMessage(message);

    setMessage('');
    props.setReply(null);
  };

  return (
    <ChatForm>
      {reply && (
        <ChatReplyInfo>
          <span>
            Replying to{' '}
            <b>
              {reply.createdUser.details.fullName ||
                reply.createdUser.details.email}
            </b>
            <Icon
              icon="times-circle"
              onClick={() => props.setReply(null)}
              size={18}
              style={{ float: 'right', cursor: 'pointer' }}
            />
          </span>
          <div dangerouslySetInnerHTML={{ __html: reply.content }} />
        </ChatReplyInfo>
      )}
      <EditorCK
        name="message"
        content={message}
        onChange={(e: any) => setMessage(e.editor.getData())}
        onCtrlEnter={handleSendMessage}
        toolbar={[
          {
            name: 'basicstyles',
            items: [
              'Bold',
              'Italic',
              '-',
              'Link',
              'Unlink',
              '-',
              'Image',
              'EmojiPanel'
            ]
          }
        ]}
        removePlugins="elementspath"
        autoGrow={false}
        height={100}
        autoFocus
      />
      <span>Control + Enter to send a message</span>
    </ChatForm>
  );
};

export default ChatInput;

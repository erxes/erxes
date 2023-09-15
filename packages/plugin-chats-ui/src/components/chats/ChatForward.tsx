import React from 'react';
import Tip from '@erxes/ui/src/components/Tip';
import { MessageOption } from '../../styles';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ChatList from '../../containers/chats/ChatList';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  forwardChat?: (id: string, type: string) => void;
  currentUser: IUser;
  forwardedChatIds?: string[];
  isWidget: boolean;
};

const ChatForward = (props: Props) => {
  return (
    <ModalTrigger
      trigger={
        <MessageOption>
          <Tip placement="top" text="Forward">
            <Icon icon="export" color="#9d9d9d" />
          </Tip>
        </MessageOption>
      }
      content={modalProps => (
        <ChatList
          {...modalProps}
          forwardedChatIds={props.forwardedChatIds}
          forwardChat={props.forwardChat}
          isForward={true}
          isWidget={props.isWidget}
        />
      )}
      title="Send to"
    />
  );
};

export default ChatForward;

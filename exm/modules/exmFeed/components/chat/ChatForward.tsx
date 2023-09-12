import React from "react";
import Tip from "../../../common/Tip";
import { MessageOption } from "../../styles";
import Icon from "../../../common/Icon";
import ModalTrigger from "../../../common/ModalTrigger";
import ChatList from "../../containers/chat/ChatList";
import { IUser } from "../../../auth/types";

type Props = {
  forwardChat?: (chatId?: string) => void;
  currentUser: IUser;
  forwardedChatIds?: string[];
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
      content={(p) => (
        <ChatList
          {...p}
          forwardedChatIds={props.forwardedChatIds}
          forwardChat={props.forwardChat}
          isForward={true}
          currentUser={props.currentUser}
        />
      )}
      title="Send to"
    />
  );
};

export default ChatForward;

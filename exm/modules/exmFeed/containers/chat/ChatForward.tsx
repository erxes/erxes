import gql from "graphql-tag";
import { mutations } from "../../graphql";
import { useMutation } from "@apollo/client";
import Alert from "../../../utils/Alert";
import ChatForward from "../../components/chat/ChatForward";
import { IUser } from "../../../auth/types";
import { useState } from "react";

type Props = {
  currentUser: IUser;
  content?: any;
  attachments?: any;
};

const ChatForwardContainer = (props: Props) => {
  const [forwardedChatIds, setForwardedChatIds] = useState([]);

  const [chatForward] = useMutation(gql(mutations.chatForward));

  const forwardChat = (chatId?: string) => {
    chatForward({
      variables: {
        chatId,
        content: props.content,
        attachments: props.attachments,
      },
    })
      .then(() => {
        setForwardedChatIds([...forwardedChatIds, chatId]);
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  return (
    <ChatForward
      currentUser={props.currentUser}
      forwardedChatIds={forwardedChatIds}
      forwardChat={forwardChat}
    />
  );
};

export default ChatForwardContainer;

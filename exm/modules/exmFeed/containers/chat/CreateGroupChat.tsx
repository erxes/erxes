import React from "react";
import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
// erxes
import { Alert } from "../../../utils";
// local
import Component from "../../components/chat/CreateGroupChat";
import { mutations, queries } from "../../graphql";

type Props = {
  closeModal: () => void;
  handleClickItem?: (chatId: string) => void;
};

const CreateGroupChatContainer = (props: Props) => {
  const [chatAddMutation] = useMutation(gql(mutations.chatAdd));

  const startGroupChat = (name: string, userIds: string[]) => {
    if (!name) {
      return Alert.error("Name is required!");
    }

    if (userIds.length === 0) {
      return Alert.error("Select users!");
    }

    chatAddMutation({
      variables: { name, type: "group", participantIds: userIds || [] },
      refetchQueries: [
        {
          query: gql(queries.chats),
        },
      ],
    })
      .then(({data}) => {
        props.closeModal();
        props.handleClickItem(data.chatAdd._id);
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  return <Component {...props} startGroupChat={startGroupChat} />;
};

export default CreateGroupChatContainer;

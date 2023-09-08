import ChatList from "../../components/chat/ChatList";
import { IUser } from "../../../auth/types";
import gql from "graphql-tag";
import { queries } from "../../graphql";
import { useQuery } from "@apollo/client";

const ChatListContainer = ({ currentUser = {} as IUser }) => {
  const usersQuery = useQuery(gql(queries.users));

  if (usersQuery.loading) {
    return null;
  }

  const users = usersQuery
    ? usersQuery.data.users.filter((u) => u._id !== currentUser._id)
    : [];

  return <ChatList users={users} />;
};

export default ChatListContainer;

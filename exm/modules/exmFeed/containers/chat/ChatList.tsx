import ChatList from '../../components/chat/ChatList';
import { IUser } from '../../../auth/types';
import gql from 'graphql-tag';
import { queries, mutations } from '../../graphql';
import { useQuery, useMutation } from '@apollo/client';
import Alert from '../../../utils/Alert';

type Props = {
  currentUser: IUser;
  handleActive?: (chatId: string) => void;
  isForward?: boolean;
  forwardChat?: (id?: string, type?: string) => void;
};

const ChatListContainer = (props: Props) => {
  const { currentUser } = props;
  const usersQuery = useQuery(gql(queries.allUsers), {
    variables: {
      isActive: true
    }
  });
  const chatsQuery = useQuery(gql(queries.chats));
  const [togglePinnedChat] = useMutation(gql(mutations.chatToggleIsPinned));

  const togglePinned = (chatId) => {
    togglePinnedChat({
      variables: { id: chatId },
      refetchQueries: [{ query: gql(queries.chats) }]
    }).catch((error) => {
      Alert.error(error.message);
    });
  };

  if (usersQuery.loading || chatsQuery.loading) {
    return null;
  }

  const users = usersQuery
    ? usersQuery.data?.allUsers.filter((u) => u._id !== currentUser._id)
    : [];

  return (
    <ChatList
      currentUser={currentUser}
      {...props}
      users={users}
      chats={chatsQuery.data?.chats.list || []}
      togglePinned={togglePinned}
      forwardChat={props.forwardChat}
    />
  );
};

export default ChatListContainer;

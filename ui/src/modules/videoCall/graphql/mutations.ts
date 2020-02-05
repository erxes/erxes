const deleteVideoChatRoom = `
  mutation conversationDeleteVideoChatRoom($name: String!) {
    conversationDeleteVideoChatRoom(name: $name)
  }
`;

const createVideoChatRoom = `
  mutation conversationCreateVideoChatRoom($_id: String!) {
    conversationCreateVideoChatRoom(_id: $_id) {
      url
      name
    }
  }
`;

export default {
  deleteVideoChatRoom,
  createVideoChatRoom
};

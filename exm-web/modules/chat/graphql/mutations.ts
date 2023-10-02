import gql from "graphql-tag"

const chatAdd = gql`
  mutation chatAdd($name: String, $type: ChatType!, $participantIds: [String]) {
    chatAdd(name: $name, type: $type, participantIds: $participantIds) {
      _id
    }
  }
`

const chatEdit = gql`
  mutation chatEdit($_id: String!, $name: String, $featuredImage: JSON) {
    chatEdit(_id: $_id, name: $name, featuredImage: $featuredImage) {
      _id
    }
  }
`

const chatRemove = gql`
  mutation chatRemove($id: String!) {
    chatRemove(_id: $id)
  }
`

const chatMarkAsRead = gql`
  mutation chatMarkAsRead($id: String!) {
    chatMarkAsRead(_id: $id)
  }
`

const chatMessageAdd = gql`
  mutation chatMessageAdd(
    $chatId: String!
    $content: String!
    $relatedId: String
    $attachments: [JSON]
  ) {
    chatMessageAdd(
      chatId: $chatId
      content: $content
      relatedId: $relatedId
      attachments: $attachments
    ) {
      _id
    }
  }
`

const chatAddOrRemoveMember = gql`
  mutation chatAddOrRemoveMember(
    $id: String!
    $type: ChatMemberModifyType
    $userIds: [String]
  ) {
    chatAddOrRemoveMember(_id: $id, type: $type, userIds: $userIds)
  }
`

const chatMakeOrRemoveAdmin = gql`
  mutation chatMakeOrRemoveAdmin($id: String!, $userId: String!) {
    chatMakeOrRemoveAdmin(_id: $id, userId: $userId)
  }
`

const chatToggleIsPinned = gql`
  mutation chatToggleIsPinned($id: String!) {
    chatToggleIsPinned(_id: $id)
  }
`

const emojiReact = gql`
  mutation emojiReact(
    $contentId: String!
    $contentType: ReactionContentType!
    $type: String
  ) {
    emojiReact(contentId: $contentId, contentType: $contentType, type: $type)
  }
`

const commentAdd = gql`
  mutation commentAdd(
    $contentId: String!
    $contentType: ReactionContentType!
    $comment: String!
    $parentId: String
  ) {
    commentAdd(
      contentId: $contentId
      contentType: $contentType
      comment: $comment
      parentId: $parentId
    ) {
      _id
    }
  }
`

const commentRemove = gql`
  mutation commentRemove($_id: String!) {
    commentRemove(_id: $_id)
  }
`

const chatForward = gql`
  mutation chatForward(
    $chatId: String
    $userIds: [String]
    $content: String
    $attachments: [JSON]
  ) {
    chatForward(
      chatId: $chatId
      userIds: $userIds
      content: $content
      attachments: $attachments
    ) {
      _id
    }
  }
`

export default {
  chatAdd,
  chatEdit,
  chatRemove,
  chatMarkAsRead,
  chatMessageAdd,
  chatAddOrRemoveMember,
  chatMakeOrRemoveAdmin,
  chatToggleIsPinned,
  emojiReact,
  commentAdd,
  commentRemove,
  chatForward,
}

import { IAttachment } from "@/modules/types"
import { ApolloError, useMutation } from "@apollo/client"

import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useChatsMutation = ({
  callBack,
}: {
  callBack: (result: string) => void
}) => {
  const { toast } = useToast()

  const onError = (error: ApolloError) => {
    toast({ description: error.message, variant: "destructive" })
  }

  const [editChatMutation, { loading: loadingEdit }] = useMutation(
    mutations.chatEdit,
    { refetchQueries: ["chats", "chatDetail"] }
  )

  const [deleteChatMutation, { loading: loadingDelete }] = useMutation(
    mutations.chatRemove
  )

  const [deleteArchiveMutation, { loading: loadingArchive }] = useMutation(
    mutations.chatArchive
  )

  const [muteChatMutation, { loading: loadingMute }] = useMutation(
    mutations.chatToggleIsWithNotification,
    { refetchQueries: ["chats", "chatDetail"] }
  )

  const [adminMutation, { loading: loadingAdmin }] = useMutation(
    mutations.chatMakeOrRemoveAdmin
  )
  const [memberMutation, { loading: loadingMember }] = useMutation(
    mutations.chatAddOrRemoveMember
  )
  const [chatTypingMutation] = useMutation(mutations.chatTyping)

  const [pinMessageMutation] = useMutation(mutations.pinMessage)

  const [chatForwardMutation] = useMutation(mutations.chatForward)

  const pinMessage = (id: string) => {
    pinMessageMutation({
      variables: { id },
      refetchQueries: ["chatMessages"],
    }).catch((e) => console.log(e))
  }

  const chatForward = ({
    id,
    type,
    content,
    attachments,
  }: {
    id?: string
    type?: string
    content?: string
    attachments?: IAttachment[]
  }) => {
    if (type === "group") {
      chatForwardMutation({
        variables: { chatId: id, content, attachments },
        refetchQueries: ["chatMessages", "chats"],
      }).catch((e) => console.log(e))
    }

    if (type === "direct") {
      chatForwardMutation({
        variables: { userIds: [id], content, attachments },
        refetchQueries: ["chatMessages", "chats"],
      }).catch((e) => console.log(e))
    }
  }

  const [togglePinnedChat, { loading }] = useMutation(
    mutations.chatToggleIsPinned,
    {
      refetchQueries: ["chats", "chatsPinned"],
      onError,
    }
  )

  const togglePinned = (chatId: string) => {
    togglePinnedChat({
      variables: { id: chatId },
    }).then(() => {
      callBack("success")
    })
  }

  const toggleMute = (chatId: string) => {
    muteChatMutation({
      variables: { id: chatId },
    }).then(() => {
      callBack("success")
    })
  }

  const makeOrRemoveAdmin = (chatId: string, userId: string) => {
    adminMutation({
      variables: { id: chatId, userId },
      refetchQueries: ["chats", "chatDetail"],
    }).then(() => {
      callBack("success")
    })
  }

  const chatEdit = (chatId: string, name?: string, featuredImage?: any[]) => {
    editChatMutation({
      variables: { _id: chatId, name, featuredImage },
      refetchQueries: ["chats", "chatDetail"],
    }).then(() => {
      callBack("success")
    })
  }

  const chatDelete = (chatId: string) => {
    deleteChatMutation({
      variables: { id: chatId },
      refetchQueries: ["chats", "chatDetail"],
    }).then(() => {
      callBack("success")
    })
  }

  const chatArchive = (chatId: string) => {
    deleteArchiveMutation({
      variables: { id: chatId },
      refetchQueries: ["chats", "chatDetail"],
    }).then(() => {
      callBack("success")
    })
  }

  const chatTyping = (chatId: string, userId: string) => {
    chatTypingMutation({
      variables: { chatId, userId },
    })
  }

  const addOrRemoveMember = (
    chatId: string,
    type: string,
    userIds: string[]
  ) => {
    memberMutation({
      variables: { id: chatId, type, userIds },
      refetchQueries: ["chats", "chatDetail"],
    })
      .then(() => {
        callBack("success")
      })
      .catch((e) => {
        onError(e)
      })
  }

  return {
    togglePinned,
    makeOrRemoveAdmin,
    addOrRemoveMember,
    chatEdit,
    chatDelete,
    toggleMute,
    chatArchive,
    chatTyping,
    chatForward,
    pinMessage,
    loading:
      loading ||
      loadingEdit ||
      loadingDelete ||
      loadingAdmin ||
      loadingMember ||
      loadingMute ||
      loadingArchive,
  }
}

export default useChatsMutation

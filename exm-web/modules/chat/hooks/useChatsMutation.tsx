import { ApolloError, useMutation } from "@apollo/client"

import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useChatsMutation = () => {
  const { toast } = useToast()

  const onError = (error: ApolloError) => {
    toast({ description: error.message, variant: "destructive" })
  }

  const [editChatMutation, { loading: loadingEdit }] = useMutation(
    mutations.chatEdit
  )
  const [deleteChatMutation] = useMutation(mutations.chatRemove)

  const [adminMutation] = useMutation(mutations.chatMakeOrRemoveAdmin)
  const [memberMutation] = useMutation(mutations.chatAddOrRemoveMember)

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
    })
  }

  const makeOrRemoveAdmin = (chatId: string, userId: string) => {
    adminMutation({
      variables: { id: chatId, userId },
      refetchQueries: ["chats", "chatDetail"],
    })
  }

  const chatEdit = (chatId: string, name?: string, featuredImage?: any[]) => {
    editChatMutation({
      variables: { _id: chatId, name, featuredImage },
      refetchQueries: ["chats", "chatDetail"],
    })
  }

  const chatDelete = (chatId: string) => {
    deleteChatMutation({
      variables: { id: chatId },
      refetchQueries: ["chats", "chatDetail"],
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
  }

  return {
    togglePinned,
    makeOrRemoveAdmin,
    addOrRemoveMember,
    chatEdit,
    chatDelete,
    loading,
    loadingEdit,
  }
}

export default useChatsMutation

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

  const [adminMutation, { loading: loadingAdmin }] = useMutation(
    mutations.chatMakeOrRemoveAdmin
  )
  const [memberMutation, { loading: loadingMember }] = useMutation(
    mutations.chatAddOrRemoveMember
  )

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
    loading:
      loading || loadingEdit || loadingDelete || loadingAdmin || loadingMember,
  }
}

export default useChatsMutation

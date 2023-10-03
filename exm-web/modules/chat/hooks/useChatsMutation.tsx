import { ApolloError, useMutation } from "@apollo/client"

import { useToast } from "@/components/ui/use-toast"

import { mutations } from "../graphql"

const useChatsMutation = () => {
  const { toast } = useToast()

  const onError = (error: ApolloError) => {
    toast({ description: error.message, variant: "destructive" })
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
    })
  }

  return {
    togglePinned,
    loading,
  }
}

export default useChatsMutation

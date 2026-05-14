"use client"

import { useMutation } from "@apollo/client"

import { onError, toast } from "@/components/ui/use-toast"

import SettingsButton from "./components/Button"
import { mutations } from "./graphql"

const DeleteOrders = () => {
  const [deleteOrders, { loading }] = useMutation(mutations.deleteOrders, {
    onCompleted(data) {
      const { deleteOrders } = data
      toast({
        description: `${deleteOrders.deletedCount} order has been deleted successfully`,
      })
    },
    onError(error) {
      return onError(error.message)
    },
  })

  const handleClick = () => deleteOrders()

  return (
    <SettingsButton disabled={loading} onClick={handleClick}>
      Delete Less order
    </SettingsButton>
  )
}

export default DeleteOrders

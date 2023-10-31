"use client"

import { useMutation } from "@apollo/client"

import { useToast } from "@/components/ui/use-toast"

import SettingsButton from "./components/Button"
import { mutations } from "./graphql"

const DeleteOrders = () => {
  const { toast } = useToast()
  const [deleteOrders, { loading }] = useMutation(mutations.deleteOrders, {
    onCompleted(data) {
      const { deleteOrders } = data
      toast({
        description: `${deleteOrders.deletedCount} order has been deleted successfully`,
      })
    },
    onError(error) {
      return toast({ description: error.message, variant: "destructive" })
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

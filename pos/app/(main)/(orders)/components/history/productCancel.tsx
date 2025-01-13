import { useState, useEffect } from "react"
import { mutations } from "@/modules/orders/graphql"
import { useMutation } from "@apollo/client"
import { updateCartAtom } from "@/store/cart.store"
import { orderPasswordAtom } from "@/store/config.store"
import { activeOrderIdAtom, setInitialAtom } from "@/store/order.store"
import { useAtomValue, useSetAtom } from "jotai"
import { onError } from "@/components/ui/use-toast"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProductCancelProps {
  _id: string;
  number: string;
  refetchQueries?: string[];
  onCompleted?: () => void;
}

const ProductCancel = ({
  _id,
  number,
  refetchQueries = ["ActiveOrders"],
  onCompleted
}: ProductCancelProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  
  const changeItem = useSetAtom(updateCartAtom)
  const orderPassword = useAtomValue(orderPasswordAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const setInitialState = useSetAtom(setInitialAtom)

  const [cancel, { loading }] = useMutation(mutations.ordersCancel, {
    variables: { _id: activeOrderId },
    onCompleted() {
      setInitialState()
      setIsOpen(false)
      localStorage.removeItem(`cancel_${_id}`)
      onCompleted && onCompleted()
    },
    onError(error) {
      onError(error.message)
      setIsOpen(false)
    },
    refetchQueries
  })
  
  useEffect(() => {
    const cancelState = localStorage.getItem(`cancel_${_id}`)
    if (cancelState === 'pending') {
      setIsOpen(true)
    }
  }, [_id])

  const handleKeep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault() 
    setIsOpen(false)
    localStorage.removeItem(`cancel_${_id}`)
    window.location.reload()
  }

  const handleCancel = () => {
    if (!activeOrderId) {
      setInitialState()
      return
    }
    cancel()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === orderPassword || !orderPassword) {
      changeItem({ _id, count: 0 })
      handleCancel()
    } else {
      setError(true)
    }
  }

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(`cancel_${_id}`, 'pending')
    }
  }, [isOpen, _id])

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          localStorage.removeItem(`cancel_${_id}`)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Та {number} дугаартай бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Энэ бүтээгдэхүүнийг устгах бол нууц үгээ оруулна уу
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit}>
          {orderPassword && (
            <div>
              <Label htmlFor="pass">Нууц үг</Label>
              <Input
                id="pass"
                type="password"
                autoComplete="off"
                className="block my-1"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
              />

              {error && (
                <div className="text-destructive">
                  Буруу нууц үг. Дахин оруулна уу.
                </div>
              )}
            </div>
          )}

          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel onClick={handleKeep}>Болих</AlertDialogCancel>
            <Button 
              variant="destructive" 
              type="submit"
            >
              Устгах
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ProductCancel
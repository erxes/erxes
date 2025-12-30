import { useEffect, useState } from "react"
import { nextOrderIdAtom, slotFilterAtom } from "@/store"
import { cartChangedAtom } from "@/store/cart.store"
import {
  activeOrderIdAtom,
  askSaveAtom,
  orderNumberAtom,
  setInitialAtom,
} from "@/store/order.store"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

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

import useOrderCU from "../hooks/useOrderCU"

const ValidateOrderChange = () => {
  const [open, setOpen] = useState(false)
  const [activeOrder, setActiveOrder] = useAtom(activeOrderIdAtom)
  const orderNumber = useAtomValue(orderNumberAtom)
  const setCartChanged = useSetAtom(cartChangedAtom)
  const setInitialState = useSetAtom(setInitialAtom)
  const setFilterSlot = useSetAtom(slotFilterAtom)
  const [nextOrder, setNextOrder] = useAtom(nextOrderIdAtom)
  const shouldAsk = useAtomValue(askSaveAtom)

  const finalAction = () => {
    setOpen(false)
    setFilterSlot(null)
    setNextOrder(null)

    if (nextOrder === "-" || activeOrder === nextOrder) {
      return setInitialState()
    }

    setActiveOrder(nextOrder)
    setCartChanged(false)
  }

  const { orderCU, loading } = useOrderCU(finalAction)

  useEffect(() => {
    if (nextOrder) {
      shouldAsk ? setOpen(true) : finalAction()
    }
  }, [nextOrder])

  return (
    <AlertDialog
      open={open}
      onOpenChange={(op) => {
        if (loading) {
          return null
        }
        setOpen(op)
        setNextOrder(null)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {!activeOrder
              ? `Шинээр үүсгэж буй`
              : `${orderNumber} дугаартай идэвхтэй`}{" "}
            захиалгын өөрчлөлтийг хадгалах уу
          </AlertDialogTitle>
          <AlertDialogDescription>
            Хэрэв та "Хадгалахгүй" дээр дарвал таны сүүлийн өөрчлөлт
            хадгалагдахгүй.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button disabled={loading} onClick={() => orderCU()}>
            Хадгалах
          </Button>
          <Button variant="outline" disabled={loading} onClick={finalAction}>
            Хадгалахгүй
          </Button>
          <AlertDialogCancel disabled={loading}>Буцах</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ValidateOrderChange

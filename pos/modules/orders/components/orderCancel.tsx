import { FormEvent,  useState } from "react"
import { mutations } from "@/modules/orders/graphql"
import { orderPasswordAtom } from "@/store/config.store"
import { paymentDetailAtom } from "@/store/history.store"
import { activeOrderIdAtom, openCancelDialogAtom, setInitialAtom } from "@/store/order.store"
import { useMutation } from "@apollo/client"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import useFocus from "@/lib/useFocus"
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { onError } from "@/components/ui/use-toast"
import { IOrder } from "@/types/order.types"

export const HistoryOrderCancelTrigger = ({
  loading,
  _id,
}: {
  loading?: boolean
  _id: string
}) => {
  const paymentDetail =
    useAtomValue(paymentDetailAtom)
  const { changeOpen, lessZero } = useOrderCancel(paymentDetail)

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive"
      onClick={() => changeOpen(_id)}
      disabled={loading || lessZero}
    >
      Устгах
    </DropdownMenuItem>
  )
}

export const CheckoutCancel = ({ order }: { order: IOrder | null }) => {
  if (!order) return null;

  const { _id, number } = order || {};
  if (!_id) return null;

  return (<OrderCancel _id={_id} number={number ?? ""} refetchQueries={['ActiveOrders']} />);
};

export const useOrderCancel = (order
  :IOrder | null
) => {
  const { cashAmount, mobileAmount, paidAmounts } = order || {}
  const changeOpen = useSetAtom(openCancelDialogAtom)

  const paidTotal =
    (cashAmount ?? 0) +
    (mobileAmount ?? 0) +
    (paidAmounts?.reduce((total, el) => el.amount + total, 0) ?? 0)
  
  return {
    changeOpen,
    lessZero: paidTotal <= 0,
  }
}

const OrderCancel = ({
  _id,
  number,
  refetchQueries,
  onCompleted,
}: {
  _id: string
  number: string
  refetchQueries?: string[]
  onCompleted?: () => void
}) => {
  const orderPassword = useAtomValue(orderPasswordAtom)
  const [open, changeOpen] = useAtom(openCancelDialogAtom)
  const activeOrderId = useAtomValue(activeOrderIdAtom)
  const reset = useSetAtom(setInitialAtom)
  const [value, setValue] = useState("")
  const [error, setError] = useState(false)
  const [ref, setFocus] = useFocus()

  const focus = () => setTimeout(() => setFocus(), 30)

  const [orderCancel, { loading }] = useMutation(mutations.ordersCancel, {
    variables: {
      _id,
    },
    onCompleted() {
      changeOpen(null)
      focus()
      !!onCompleted && onCompleted()
      activeOrderId === _id && reset()
    },
    onError(error) {
      onError(error.message)
      changeOpen(null)
      focus()
    },
    refetchQueries: refetchQueries || ["OrdersHistory"],
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value === orderPassword || !orderPassword) {
      return orderCancel()
    }
    return setError(true)
  }
  const handleCancel = () => {
    changeOpen(null);
    reset();
  };

  return (
    <>
      <AlertDialog
        open={open === _id}
        onOpenChange={() => {
          changeOpen(null)
          focus()
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Та {number} дугаартай захиалгыг устгахдаа итгэлтэй байна уу?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Энэ үйлдлийг буцаах боломжгүй. Энэ нь таны захиалгийг бүрмөсөн
              устгана
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
                  onChange={(e) => setValue(e.target.value)}
                />

                <div
                  className={
                    error ? "text-destructive" : "text-muted-foreground"
                  }
                >
                  Баталгаажуулах нууц {error && "зөв"} үгээ оруулана уу
                </div>
              </div>
            )}

            <AlertDialogFooter className="pt-6">
              <AlertDialogCancel onClick={handleCancel}>Болих</AlertDialogCancel>
              <Button variant="destructive" type="submit" loading={loading}>
                Устгах
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
      <div ref={ref} />
    </>
  )
}

export default OrderCancel

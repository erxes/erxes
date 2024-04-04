import { FormEvent, useState } from "react"
import { mutations } from "@/modules/orders/graphql"
import { orderPasswordAtom } from "@/store/config.store"
import { openCancelDialogAtom, paymentDetailAtom } from "@/store/history.store"
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
import { useToast } from "@/components/ui/use-toast"

export const OrderCancelTrigger = ({
  loading,
  _id,
}: {
  loading?: boolean
  _id: string
}) => {
  const changeOpen = useSetAtom(openCancelDialogAtom)
  const { cashAmount, mobileAmount, paidAmounts } =
    useAtomValue(paymentDetailAtom) || {}

  const paidTotal =
    (cashAmount || 0) +
    (mobileAmount || 0) +
    (paidAmounts?.reduce((total, el) => el.amount + total, 0) || 0)

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive"
      onClick={() => changeOpen(_id)}
      disabled={loading || paidTotal > 0}
    >
      Устгах
    </DropdownMenuItem>
  )
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
  const { onError } = useToast()
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
    },
    onError(error) {
      onError(error)
      changeOpen(null)
      focus()
    },
    refetchQueries: refetchQueries || ["OrdersHistory"],
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value === orderPassword) {
      return orderCancel()
    }
    return setError(true)
  }

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
            <Label htmlFor="pass">Нууц үг</Label>
            <Input
              id="pass"
              type="password"
              autoComplete="off"
              className="block my-1"
              onChange={(e) => setValue(e.target.value)}
            />
            <div
              className={error ? "text-destructive" : "text-muted-foreground"}
            >
              Баталгаажуулах нууц {error && "зөв"} үгээ оруулана уу
            </div>

            <AlertDialogFooter className="pt-6">
              <AlertDialogCancel>Болих</AlertDialogCancel>
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

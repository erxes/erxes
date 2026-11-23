import { FormEvent, useState } from "react"
import { filterItemClass } from "@/modules/filter"
import { mutations } from "@/modules/orders/graphql"
import { orderPasswordAtom } from "@/store/config.store"
import { paymentDetailAtom } from "@/store/history.store"
import {
  activeOrderIdAtom,
  openCancelDialogAtom,
  setInitialAtom,
} from "@/store/order.store"
import { useMutation } from "@apollo/client"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Trash2Icon } from "lucide-react"

import { IOrder } from "@/types/order.types"
import useFocus from "@/lib/useFocus"
import { cn } from "@/lib/utils"
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
import { CommandItem } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { onError } from "@/components/ui/use-toast"

export const HistoryOrderCancelTrigger = ({
  loading,
  _id,
  onSelect,
}: {
  loading?: boolean
  _id: string
  onSelect: () => void
}) => {
  const paymentDetail = useAtomValue(paymentDetailAtom)
  const { changeOpen, lessZero } = useOrderCancel(paymentDetail)

  return (
    <CommandItem
      value="cancel"
      className={cn(
        filterItemClass,
        "text-destructive aria-selected:bg-destructive/10 aria-selected:text-destructive"
      )}
      disabled={loading || lessZero}
      onSelect={() => {
        onSelect()
        changeOpen(_id)
      }}
    >
      <Trash2Icon />
      Устгах
    </CommandItem>
  )
}

export const CheckoutCancel = ({ order }: { order: IOrder | null }) => {
  if (!order) return null

  const { _id, number } = order || {}
  if (!_id) return null

  return (
    <OrderCancel
      _id={_id}
      number={number ?? ""}
      refetchQueries={["ActiveOrders"]}
    />
  )
}

export const useOrderCancel = (order: IOrder | null) => {
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

  const combinedRefetchQueries = Array.from(
    new Set([
      ...(refetchQueries ?? ["OrdersHistory"]),
      "PoscSlots",
      "ActiveOrders",
      "OrdersTotalCount",
    ])
  )

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
    refetchQueries: combinedRefetchQueries,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (value === orderPassword || !orderPassword) {
      return orderCancel()
    }
    return setError(true)
  }
  const handleCancel = () => {
    changeOpen(null)
    reset()
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
        <AlertDialogContent
          overlayClassName="bg-black/80"
          className="border shadow-lg sm:rounded-lg"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              <span className="tabular-nums">{number}</span> дугаартай захиалгыг
              устгах уу?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Энэ үйлдлийг буцаах боломжгүй. Захиалга бүрмөсөн устгагдана.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            {orderPassword && (
              <div className="grid gap-2">
                <Label
                  htmlFor="pass"
                  className="font-mono text-xs font-semibold uppercase leading-none text-zinc-400 dark:text-zinc-500"
                >
                  Нууц үг
                </Label>
                <Input
                  id="pass"
                  type="password"
                  autoComplete="off"
                  aria-invalid={error || undefined}
                  className="h-8 rounded-sm border-0 px-3 text-[13px] shadow-xs aria-invalid:shadow-focus-destructive"
                  onChange={(e) => {
                    setValue(e.target.value)
                    setError(false)
                  }}
                />
                <p
                  className={cn(
                    "text-xs",
                    error ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {error
                    ? "Нууц үг буруу байна"
                    : "Баталгаажуулах нууц үгээ оруулна уу"}
                </p>
              </div>
            )}

            <AlertDialogFooter className="pt-2">
              <AlertDialogCancel
                onClick={handleCancel}
                className="mt-0 h-8 rounded px-3 text-[13px] font-semibold"
              >
                Болих
              </AlertDialogCancel>
              <Button
                variant="destructive"
                type="submit"
                loading={loading}
                className="h-8 rounded px-3 text-[13px] font-semibold"
              >
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

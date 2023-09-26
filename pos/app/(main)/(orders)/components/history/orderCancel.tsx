import { mutations } from "@/modules/orders/graphql"
import { openCancelDialogAtom, paymentDetailAtom } from "@/store/history.store"
import { useMutation } from "@apollo/client"
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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
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

const OrderCancel = ({ _id, number }: { _id: string; number: string }) => {
  const [open, changeOpen] = useAtom(openCancelDialogAtom)
  const { onError } = useToast()

  const [orderCancel, { loading }] = useMutation(mutations.ordersCancel, {
    variables: {
      _id,
    },
    onCompleted() {
      changeOpen(null)
    },
    onError(error) {
      onError(error)
      changeOpen(null)
    },
    refetchQueries: ["OrdersHistory"],
  })

  return (
    <AlertDialog
      open={open === _id}
      onOpenChange={() => changeOpen(open === _id ? null : _id)}
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
        <AlertDialogFooter>
          <AlertDialogCancel>Болих</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => orderCancel()}
            loading={loading}
          >
            Устгах
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default OrderCancel

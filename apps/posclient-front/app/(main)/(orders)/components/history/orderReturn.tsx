import { openReturnDialogAtom } from "@/store/history.store"
import { useAtom, useSetAtom } from "jotai"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import ReturnForm from "./ReturnForm"

const OrderReturn = ({
  _id,
  number,
  totalAmount,
}: {
  _id: string
  number: string
  totalAmount: number
}) => {
  const [open, changeOpen] = useAtom(openReturnDialogAtom)

  return (
    <AlertDialog
      open={open === _id}
      onOpenChange={() => changeOpen(open === _id ? null : _id)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-between">
            <span>Буцаалт хийх</span>
            {number}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <ReturnForm totalAmount={totalAmount} _id={_id} />
      </AlertDialogContent>
    </AlertDialog>
  )
}

export const OrderReturnTrigger = ({
  _id,
  paidDate,
}: {
  _id: string
  paidDate: string | null
}) => {
  const changeOpen = useSetAtom(openReturnDialogAtom)
  return (
    <DropdownMenuItem onClick={() => changeOpen(_id)} disabled={!paidDate}>
      Буцааx
    </DropdownMenuItem>
  )
}

export default OrderReturn

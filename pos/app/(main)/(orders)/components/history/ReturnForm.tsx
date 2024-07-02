import { mutations } from "@/modules/orders/graphql"
import { paymentTypesAtom } from "@/store/config.store"
import { openReturnDialogAtom, paymentDetailAtom } from "@/store/history.store"
import { useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"
import { useForm } from "react-hook-form"

import { IPaidAmount } from "@/types/order.types"
import { ALL_BANK_CARD_TYPES } from "@/lib/constants"
import {
  AlertDialogCancel,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { onError } from "@/components/ui/use-toast"

import ReturnOdd from "./ReturnOdd"

const ReturnForm = ({
  totalAmount,
  _id,
}: {
  totalAmount: number
  _id: string
}) => {
  const changeOpen = useSetAtom(openReturnDialogAtom)
  const paymentTypes = useAtomValue(paymentTypesAtom) || []

  const notBankPts = paymentTypes?.filter(
    (pt) => !ALL_BANK_CARD_TYPES.includes(pt.type)
  )

  const { cashAmount, paidAmounts } = useAtomValue(paymentDetailAtom) || {}

  let amounts: { [key: string]: number } = {}

  const nonBankPas = paidAmounts?.filter(
    (pt: IPaidAmount) => !ALL_BANK_CARD_TYPES.includes(pt.type)
  )

  nonBankPas?.map((pa: { type: string; amount: number }) => {
    amounts[pa.type] = pa.amount
  })

  const form = useForm<any>({
    defaultValues: { cashAmount, ...amounts },
  })

  const [orderReturn, { loading: loadingReturn }] = useMutation(
    mutations.ordersReturn,
    {
      onError(err) {
        onError(err.message)
        changeOpen(null)
      },
      onCompleted() {
        changeOpen(null)
      },
      refetchQueries: ["OrdersHistory"],
    }
  )

  const onSubmit = (data: any) => {
    const { cashAmount, ...rest } = data
    const paidAmounts = Object.keys(rest).map((key: string) => ({
      type: key,
      amount: isNaN(Number(rest[key])) ? 0 : Number(rest[key]),
    }))
    orderReturn({
      variables: { _id, cashAmount: Number(cashAmount || 0), paidAmounts },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="cashAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cash</FormLabel>
                <FormControl>
                  <Input {...field} type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {notBankPts.map((pt) => (
            <FormField
              control={form.control}
              name={pt.type}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{pt.title}</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              key={pt.type}
            />
          ))}
        </div>
        <AlertDialogFooter className="pt-4 sm:justify-between items-center">
          <ReturnOdd totalAmount={totalAmount} control={form.control} />
          <div className="flex items-center gap-2">
            <AlertDialogCancel asChild>
              <Button
                className="font-semibold px-6"
                type="button"
                variant="outline"
              >
                Болих
              </Button>
            </AlertDialogCancel>
            <Button
              className="font-semibold"
              type="submit"
              loading={loadingReturn}
            >
              Буцаалт хадгалах
            </Button>
          </div>
        </AlertDialogFooter>
      </form>
    </Form>
  )
}

export default ReturnForm

import { mutations } from "@/modules/orders/graphql"
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
} from "@/modules/record-side-panel"
import { paymentTypesAtom } from "@/store/config.store"
import { openReturnDialogAtom } from "@/store/history.store"
import { useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"
import {
  BanknoteIcon,
  CreditCardIcon,
  MessageSquareTextIcon,
} from "lucide-react"
import { useForm } from "react-hook-form"

import { IPaidAmount } from "@/types/order.types"
import { ALL_BANK_CARD_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { onError, toast } from "@/components/ui/use-toast"

import ReturnOdd from "./ReturnOdd"

export type ReturnFormValues = Record<string, string | number>

const ReturnForm = ({
  totalAmount,
  _id,
  cashAmount,
  paidAmounts,
}: {
  totalAmount: number
  _id: string
  cashAmount?: number
  paidAmounts?: IPaidAmount[]
}) => {
  const changeOpen = useSetAtom(openReturnDialogAtom)
  const paymentTypes = useAtomValue(paymentTypesAtom) || []

  const notBankPts = paymentTypes.filter(
    (pt) => !ALL_BANK_CARD_TYPES.includes(pt.type)
  )

  const amounts: Record<string, number> = {}
  ;(paidAmounts || [])
    .filter((pa: IPaidAmount) => !ALL_BANK_CARD_TYPES.includes(pa.type))
    .forEach((pa: IPaidAmount) => {
      amounts[pa.type] = pa.amount
    })

  const form = useForm<ReturnFormValues>({
    defaultValues: { cashAmount: cashAmount ?? 0, description: "", ...amounts },
  })
  const { errors } = form.formState

  const [orderReturn, { loading: loadingReturn }] = useMutation(
    mutations.ordersReturn,
    {
      onError(err) {
        onError(err.message)
      },
      onCompleted() {
        toast({ description: "Буцаалт амжилттай хадгалагдлаа", variant: "success" })
        changeOpen(null)
      },
      refetchQueries: ["OrdersHistory"],
    }
  )

  const onSubmit = (data: ReturnFormValues) => {
    const { cashAmount: cash, description, ...rest } = data
    const returnedAmounts = Object.keys(rest).map((key) => ({
      type: key,
      amount: Number.isNaN(Number(rest[key])) ? 0 : Number(rest[key]),
    }))
    orderReturn({
      variables: {
        _id,
        cashAmount: Number(cash || 0),
        paidAmounts: returnedAmounts,
        description: String(description ?? "").trim(),
      },
    })
  }

  const amountClassName = cn(PANEL_INPUT_CLASS_NAME, "tabular-nums")

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <PanelFormLayout
        onCancel={() => changeOpen(null)}
        saving={loadingReturn}
        saveLabel="Буцаалт хадгалах"
        summary={<ReturnOdd totalAmount={totalAmount} control={form.control} />}
      >
        <h3 className="flex h-7 items-center px-1 text-xs font-normal text-muted-foreground">
          Буцаах дүн
        </h3>
        <PanelFormRow icon={BanknoteIcon} label="Бэлэн мөнгө">
          <Input
            {...form.register("cashAmount")}
            type="number"
            inputMode="decimal"
            aria-label="Бэлэн мөнгө"
            className={amountClassName}
          />
        </PanelFormRow>
        {notBankPts.map((pt) => (
          <PanelFormRow key={pt.type} icon={CreditCardIcon} label={pt.title}>
            <Input
              {...form.register(pt.type)}
              type="number"
              inputMode="decimal"
              aria-label={pt.title}
              className={amountClassName}
            />
          </PanelFormRow>
        ))}
        <h3 className="mt-2 flex h-7 items-center px-1 text-xs font-normal text-muted-foreground">
          Тайлбар
        </h3>
        <PanelFormRow
          icon={MessageSquareTextIcon}
          label="Шалтгаан"
          required
          error={errors.description?.message}
        >
          <Textarea
            {...form.register("description", {
              validate: (value) =>
                String(value ?? "").trim()
                  ? true
                  : "Буцаалтын тайлбар оруулна уу",
            })}
            aria-label="Буцаалтын шалтгаан"
            aria-invalid={!!errors.description || undefined}
            placeholder="Яагаад буцааж байгааг бичнэ үү"
            rows={3}
            className={cn(
              PANEL_INPUT_CLASS_NAME,
              "h-auto min-h-20 py-1.5 aria-invalid:shadow-focus-destructive"
            )}
          />
        </PanelFormRow>
      </PanelFormLayout>
    </form>
  )
}

export default ReturnForm

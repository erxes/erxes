import { Control, useWatch } from "react-hook-form"

import type { ReturnFormValues } from "./ReturnForm"

const ReturnOdd = ({
  totalAmount,
  control,
}: {
  totalAmount: number
  control: Control<ReturnFormValues>
}) => {
  const values = useWatch({ control })

  const total = Object.entries(values)
    .filter(([key]) => key !== "description")
    .reduce<number>(
      (acc, [, curr]) =>
        Number.isNaN(Number(curr)) ? acc : acc + Number(curr),
      0
    )

  return (
    <div className="text-[13px] text-muted-foreground">
      Зөрүү:{" "}
      <span className="font-semibold tabular-nums text-foreground">
        {(totalAmount - total).toLocaleString()}₮
      </span>
    </div>
  )
}

export default ReturnOdd

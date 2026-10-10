import { updateCartAtom } from "@/store/cart.store"
import { useSetAtom } from "jotai"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useProductConditions } from "../../hooks/useProductConditions"

// Select items cannot carry an empty value, so a plain sale has its own key.
const NONE = "__none__"

type ConditionProps = {
  _id: string
  productId: string
  conditionCode?: string | null
}

// Optional: a unit sold as it is needs no condition.
export const CartItemConditionSelect = ({
  _id,
  productId,
  conditionCode,
  className,
}: ConditionProps & { className?: string }) => {
  const changeItem = useSetAtom(updateCartAtom)
  const { conditions } = useProductConditions(productId)

  if (!conditions.length) return null

  return (
    <Select
      value={conditionCode || NONE}
      onValueChange={(value) =>
        changeItem({ _id, conditionCode: value === NONE ? null : value })
      }
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Энгийн</SelectItem>
        {conditions.map((condition) => (
          <SelectItem key={condition._id} value={condition.code}>
            {condition.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const CartItemCondition = (props: ConditionProps) => {
  const { conditions } = useProductConditions(props.productId)

  if (!conditions.length) return null

  return (
    <div>
      <Label>Нөхцөл</Label>
      <CartItemConditionSelect {...props} />
    </div>
  )
}

export const CartItemConditionBadge = ({
  productId,
  conditionCode,
}: {
  productId: string
  conditionCode?: string | null
}) => {
  const { conditions } = useProductConditions(conditionCode ? productId : null)
  const name = conditions.find(({ code }) => code === conditionCode)?.name

  if (!name) return null

  return (
    <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
      {name}
    </span>
  )
}

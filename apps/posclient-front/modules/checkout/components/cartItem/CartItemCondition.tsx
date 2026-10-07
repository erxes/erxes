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

import { useProductConditionGroup } from "../../hooks/useProductConditionGroup"

// Select items cannot carry an empty value, so a plain sale has its own key.
const NONE = "__none__"

type ConditionProps = {
  _id: string
  conditionGroupId?: string | null
  conditionId?: string | null
}

// Optional: a unit sold as it is needs no condition.
export const CartItemConditionSelect = ({
  _id,
  conditionGroupId,
  conditionId,
  className,
}: ConditionProps & { className?: string }) => {
  const changeItem = useSetAtom(updateCartAtom)
  const { group } = useProductConditionGroup(conditionGroupId)

  if (!group?.conditions.length) return null

  return (
    <Select
      value={conditionId || NONE}
      onValueChange={(value) =>
        changeItem({ _id, conditionId: value === NONE ? null : value })
      }
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>Энгийн</SelectItem>
        {group.conditions.map((condition) => (
          <SelectItem key={condition._id} value={condition._id}>
            {condition.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const CartItemCondition = (props: ConditionProps) => {
  const { group } = useProductConditionGroup(props.conditionGroupId)

  if (!group?.conditions.length) return null

  return (
    <div>
      <Label>Нөхцөл</Label>
      <CartItemConditionSelect {...props} />
    </div>
  )
}

export const CartItemConditionBadge = ({
  conditionGroupId,
  conditionId,
}: {
  conditionGroupId?: string | null
  conditionId?: string | null
}) => {
  const { group } = useProductConditionGroup(
    conditionId ? conditionGroupId : null
  )
  const name = group?.conditions.find(({ _id }) => _id === conditionId)?.name

  if (!name) return null

  return (
    <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
      {name}
    </span>
  )
}

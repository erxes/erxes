import { mutations } from "@/modules/orders/graphql"
import { useMutation } from "@apollo/client"
import { SoupIcon, TruckIcon } from "lucide-react"

import { OrderItem } from "@/types/order.types"
import { ORDER_ITEM_STATUSES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "@/components/ui/image"
import { LoaderIcon } from "@/components/ui/loader"
import { Toggle } from "@/components/ui/toggle"
import { useToast } from "@/components/ui/use-toast"

const ActiveOrderItem = ({
  productName,
  count,
  isTake,
  status,
  _id,
  attachment,
  description,
}: OrderItem) => {
  const { onError } = useToast()
  const [changeStatus, { loading }] = useMutation(
    mutations.orderItemChangeStatus,
    {
      onError,
    }
  )

  const Icon = isTake ? TruckIcon : SoupIcon

  const isDone = status === ORDER_ITEM_STATUSES.DONE

  return (
    <Toggle
      disabled={loading}
      pressed={isDone}
      className="flex-col w-full items-start h-auto py-2"
      onPressedChange={() =>
        changeStatus({
          variables: {
            _id,
            status: isDone
              ? ORDER_ITEM_STATUSES.CONFIRM
              : ORDER_ITEM_STATUSES.DONE,
          },
        })
      }
    >
      <div className="w-full justify-between flex">
        <span
          className={cn(
            "inline-flex items-end text-xs",
            isDone && "line-through"
          )}
        >
          {!loading && <Icon className={"h-5 w-5 mr-1"} />}
          {loading && <LoaderIcon />}
          {productName}
        </span>
        <b>x{count}</b>
      </div>
      {!!description && (
        <div className="w-full pl-6 py-1 text-xs text-left opacity-70">
          Нэмэлт: {description}
        </div>
      )}
      {!!attachment?.url && (
        <AspectRatio className="relative" ratio={16 / 9}>
          <Image
            src={attachment?.url || ""}
            alt={productName || ""}
            className="object-contain"
          />
        </AspectRatio>
      )}
    </Toggle>
  )
}

export default ActiveOrderItem

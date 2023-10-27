import { mutations } from "@/modules/orders/graphql"
import { useMutation } from "@apollo/client"
import { ExternalLinkIcon, SoupIcon, TruckIcon } from "lucide-react"

import { OrderItem } from "@/types/order.types"
import { ORDER_ITEM_STATUSES } from "@/lib/constants"
import { cn, getEnv, READ_FILE } from "@/lib/utils"
import Image from "@/components/ui/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="hover:bg-slate-100 rounded">
      <Toggle
        disabled={loading}
        pressed={isDone}
        className="flex-col w-full items-start h-auto py-2 peer"
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
      </Toggle>
      <div
        className={cn(
          "w-full space-y-2 text-left text-xs peer-hover:bg-slate-100",
          !!(attachment?.url || description) && "p-3"
        )}
      >
        {!!description && (
          <div>
            <Label htmlFor="description">Тайлбар</Label>
            <Input
              id="description"
              placeholder="Тайлбар бичих"
              value={description}
              disabled
            />
          </div>
        )}
        {!!attachment?.url && (
          <div>
            <Label htmlFor="attachment">Хавсралт</Label>
            <div className="relative w-full border rounded-md group overflow-hidden">
              <Image
                src={
                  getEnv().NEXT_PUBLIC_MAIN_API_DOMAIN +
                  READ_FILE +
                  attachment?.url
                }
                alt={productName || ""}
                height={96}
                width={96}
                className="object-contain mx-auto"
              />
              <a
                className="absolute bg-black/10 inset-0 hidden group-hover:flex items-center justify-center"
                target="_black"
                href={
                  getEnv().NEXT_PUBLIC_MAIN_API_DOMAIN +
                  READ_FILE +
                  attachment?.url
                }
              >
                <ExternalLinkIcon className="text-white" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActiveOrderItem

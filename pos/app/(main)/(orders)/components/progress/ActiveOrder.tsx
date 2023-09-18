import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { columnNumberAtom, showItemsAtom } from "@/store/progress.store"
import { useAtomValue } from "jotai"
import { ChevronsUpDownIcon, SoupIcon, TruckIcon } from "lucide-react"

import { IOrder } from "@/types/order.types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import ActiveOrderItem from "./ActiveOrderItem"
import ChangeOrderStatus from "./ChangeOrderStatus"
import TimerBadge from "./TimerBadge"

const DeliveryInfo = dynamic(() => import("./deliveryInfo"))

const ActiveOrder = ({
  number,
  type,
  status,
  modifiedAt,
  dueDate,
  items,
  _id,
}: IOrder) => {
  const numberArr = (number || "").split("_")
  const colNum = useAtomValue(columnNumberAtom)
  const showItems = useAtomValue(showItemsAtom)
  const [show, setShow] = useState(false)
  const TypeIcon = type === "eat" ? SoupIcon : TruckIcon

  useEffect(() => {
    setShow(showItems)
  }, [showItems])

  return (
    <Collapsible open={show} onOpenChange={(open) => setShow(open)}>
      <Card>
        <CardHeader
          className={cn(
            "pb-2 flex-row space-y-0 gap-1",
            colNum === 3 ? "items-start" : "items-center"
          )}
        >
          <CardTitle className="flex items-center justify-between flex-wrap flex-auto flex-row gap-1">
            <div className="inline-flex items-center">
              <TypeIcon className="mr-1 h-5 w-5" />
              <span>
                <span className="text-base">{numberArr[1]}</span>{" "}
                <small className="text-slate-600 font-normal">
                  {numberArr[0]}
                </small>
              </span>
            </div>
            <div className="inline-flex items-center space-x-1">
              <TimerBadge date={dueDate || modifiedAt} isDueDate={!!dueDate} />
              <Badge>{status}</Badge>
            </div>
          </CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="-mr-1 px-2 h-8">
              <ChevronsUpDownIcon className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pb-2">
            <div className="border-y border-dashed py-1 space-y-0.5">
              {(items || []).map((item, i) => (
                <ActiveOrderItem key={i} {...item} />
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>

        <CardFooter className="justify-end gap-2">
          {type === "delivery" && <DeliveryInfo />}
          <ChangeOrderStatus _id={_id} items={items} status={status} />
        </CardFooter>
      </Card>
    </Collapsible>
  )
}

export default ActiveOrder

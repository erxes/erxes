import { orderCollapsibleAtom } from "@/store"
import { openCancelDialogAtom } from "@/store/history.store"
import {
  activeOrderIdAtom,
  descriptionAtom,
  dueDateAtom,
  getTotalPaidAmountAtom,
  isPreAtom,
  orderNumberAtom,
  setInitialAtom,
} from "@/store/order.store"
import { format, setHours, setMinutes } from "date-fns"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { EraserIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { CollapsibleContent } from "@/components/ui/collapsible"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import OrderCancel from "@/app/(main)/(orders)/components/history/orderCancel"

import DirectDiscount from "./directDiscount"

const DeliveryInputs = () => {
  const [description, setDescription] = useAtom(descriptionAtom)
  const [dueDate, setDueDate] = useAtom(dueDateAtom)
  const [isPre, setIsPre] = useAtom(isPreAtom)
  const paidAmount = useAtomValue(getTotalPaidAmountAtom)
  const orderId = useAtomValue(activeOrderIdAtom)
  const number = useAtomValue(orderNumberAtom)
  const changeCancel = useSetAtom(openCancelDialogAtom)
  const setInitialStates = useSetAtom(setInitialAtom)
  const setOpenCollapsible = useSetAtom(orderCollapsibleAtom)

  const chageTimeOfDate = (date: string, time: string) =>
    setMinutes(
      setHours(date ? new Date(date) : new Date(), Number(time.split(":")[0])),
      Number(time.split(":")[1])
    ).toISOString()

  const changeDate = (date?: string) => {
    const formattedDate = !!dueDate
      ? chageTimeOfDate(date || "", format(new Date(dueDate), "HH:mm"))
      : date

    setDueDate(formattedDate)
  }

  const disableOnPre = paidAmount > 0 && isPre

  return (
    <CollapsibleContent className="col-span-2 mb-2 border-y py-3">
      <div className="space-y-3">
        <CardTitle>Хүргэлтийн мэдээлэл</CardTitle>
        <div className="flex gap-2 items-end">
          <div className="flex-auto">
            <Label className="block pb-1">Хүргэх өдөр</Label>
            <DatePicker
              date={!!dueDate ? new Date(dueDate) : undefined}
              setDate={(date) => changeDate(date?.toISOString())}
              fromDate={new Date()}
              className="w-full"
              disabled={disableOnPre}
            />
          </div>
          <div className="flex-auto">
            <Label className="block pb-1">Хүргэх цаг</Label>
            <Input
              type="time"
              value={dueDate ? format(new Date(dueDate), "HH:mm") : ""}
              onChange={(e) =>
                setDueDate(chageTimeOfDate(dueDate || "", e.target.value))
              }
              disabled={disableOnPre}
            />
          </div>
          <Button
            variant="ghost"
            className="h-10 px-3"
            size="sm"
            onClick={() => setDueDate(undefined)}
            disabled={disableOnPre}
          >
            <EraserIcon className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="isPre"
            checked={isPre}
            onCheckedChange={() => setIsPre(!isPre)}
            disabled={paidAmount > 0}
          />
          <Label htmlFor="isPre">Урьдчилсан захиалга эсэх</Label>
        </div>
        <div>
          <Label htmlFor="delivery" className="block pb-1">
            Дэлгэрэнгүй
          </Label>
          <Textarea
            className="max-h-20"
            value={description || ""}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <DirectDiscount />
        {!!orderId && (
          <>
            <Separator />
            <div className="col-span-3">
              <Button
                variant="destructive"
                onClick={() => changeCancel(orderId)}
              >
                Захиалга цуцлах
              </Button>
              <OrderCancel
                _id={orderId || ""}
                number={number}
                refetchQueries={["ActiveOrders"]}
                onCompleted={() => {
                  setInitialStates()
                  setOpenCollapsible(false)
                }}
              />
            </div>
          </>
        )}
      </div>
    </CollapsibleContent>
  )
}

export default DeliveryInputs

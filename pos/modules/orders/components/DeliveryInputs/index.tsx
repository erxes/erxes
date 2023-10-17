import { useState } from "react"
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
import { AlarmClockIcon, EraserIcon, SlidersHorizontalIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import OrderCancel from "@/app/(main)/(orders)/components/history/orderCancel"

const DeliveryInputs = () => {
  const [description, setDescription] = useAtom(descriptionAtom)
  const [dueDate, setDueDate] = useAtom(dueDateAtom)
  const [isPre, setIsPre] = useAtom(isPreAtom)
  const paidAmount = useAtomValue(getTotalPaidAmountAtom)
  const orderId = useAtomValue(activeOrderIdAtom)
  const number = useAtomValue(orderNumberAtom)
  const changeCancel = useSetAtom(openCancelDialogAtom)
  const setInitialStates = useSetAtom(setInitialAtom)
  const [open, setOpen] = useState(false)
  // const

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
    <Popover open={open} onOpenChange={() => setOpen((prev) => !prev)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "col-span-2 font-semibold h-11",
            isPre && "border-2 border-primary text-primary hover:text-primary"
          )}
        >
          {isPre ? (
            <AlarmClockIcon className="h-5 w-5 animate-bounce" />
          ) : (
            <SlidersHorizontalIcon className="h-5 w-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <CardTitle className="mb-2">Хүргэлтийн мэдээлэл</CardTitle>
        <div className="space-y-3">
          <div className="col-span-3 pb-1">
            <Label htmlFor="delivery" className="block pb-1">
              Mэдээлэл
            </Label>
            <Textarea
              className="max-h-20"
              value={description || ""}
              onChange={(e) => setDescription(e.target.value)}
            />
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
          <div className="col-span-2">
            <Label className="block pb-1">Хүргэх өдөр</Label>
            <DatePicker
              date={!!dueDate ? new Date(dueDate) : undefined}
              setDate={(date) => changeDate(date?.toISOString())}
              fromDate={new Date()}
              className="w-full"
              disabled={disableOnPre}
            />
          </div>
          <div className="flex gap-2 items-end">
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
              variant="secondary"
              className="px-3"
              onClick={() => setDueDate(undefined)}
              disabled={disableOnPre}
            >
              <EraserIcon className="h-5 w-5" />
            </Button>
          </div>
          {!!orderId && (
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
                  setOpen(false)
                }}
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default DeliveryInputs

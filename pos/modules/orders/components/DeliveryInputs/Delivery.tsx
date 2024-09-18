import {
  dueDateAtom,
  getTotalPaidAmountAtom,
  isPreAtom,
} from "@/store/order.store"
import { format, setHours, setMinutes } from "date-fns"
import { useAtom, useAtomValue } from "jotai"
import { EraserIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Delivery = () => {
  const [dueDate, setDueDate] = useAtom(dueDateAtom)
  const isPre = useAtomValue(isPreAtom)
  const paidAmount = useAtomValue(getTotalPaidAmountAtom)

  const changeTimeOfDate = (date?: string, time?: string) => {
    const timeArr = time ? time.split(":") : ["00", "00"]

    return setMinutes(
      setHours(date ? new Date(date) : new Date(), Number(timeArr[0])),
      Number(timeArr[1])
    ).toISOString()
  }

  const changeDate = (date?: string) => {
    const formattedDate = dueDate
      ? changeTimeOfDate(date, format(new Date(dueDate), "HH:mm"))
      : date

    setDueDate(formattedDate)
  }

  const disableOnPre = paidAmount > 0 && isPre
  return (
    <>
      <CardTitle>Хүргэлтийн мэдээлэл</CardTitle>
      <div className="flex gap-2 items-end">
        <div className="flex-auto">
          <Label className="block pb-1">Хүргэх өдөр</Label>
          <DatePicker
            date={dueDate ? new Date(dueDate) : undefined}
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
              setDueDate(changeTimeOfDate(dueDate, e.target.value))
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
    </>
  )
}

export default Delivery

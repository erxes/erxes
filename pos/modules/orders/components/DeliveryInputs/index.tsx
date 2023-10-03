import { descriptionAtom, dueDateAtom } from "@/store/order.store"
import { format, setHours, setMinutes } from "date-fns"
import { useAtom } from "jotai"
import { EraserIcon, SlidersHorizontalIcon } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"

const DeliveryInputs = () => {
  const [description, setDescription] = useAtom(descriptionAtom)
  const [dueDate, setDueDate] = useAtom(dueDateAtom)

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

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="col-span-2 font-semibold h-11">
          <SlidersHorizontalIcon className="h-5 w-5" />
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
          <div className="col-span-2">
            <Label className="block pb-1">Хүргэх өдөр</Label>
            <DatePicker
              date={!!dueDate ? new Date(dueDate) : undefined}
              setDate={(date) => changeDate(date?.toISOString())}
              fromDate={new Date()}
              className="w-full"
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
              />
            </div>
            <Button
              variant="secondary"
              className="px-3"
              onClick={() => setDueDate(undefined)}
            >
              <EraserIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default DeliveryInputs

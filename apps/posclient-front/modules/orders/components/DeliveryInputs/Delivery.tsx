import { useMemo } from "react"
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
} from "@/modules/record-side-panel"
import {
  dueDateAtom,
  getTotalPaidAmountAtom,
  isPreAtom,
} from "@/store/order.store"
import { parseTime } from "@internationalized/date"
import { format, setHours, setMinutes } from "date-fns"
import { useAtom, useAtomValue } from "jotai"
import { CalendarIcon, ClockIcon, EraserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { DateInput, TimeField } from "@/components/ui/time-field"

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
  const time = dueDate ? format(new Date(dueDate), "HH:mm") : ""
  const timeValue = useMemo(() => (time ? parseTime(time) : null), [time])
  return (
    <>
      <PanelFormRow label="Хүргэх өдөр" icon={CalendarIcon}>
        <DatePicker
          date={dueDate ? new Date(dueDate) : undefined}
          setDate={(date) => changeDate(date?.toISOString())}
          fromDate={new Date()}
          placeholder="Огноо сонгох"
          className={cn(
            PANEL_INPUT_CLASS_NAME,
            "w-full justify-start [&>svg]:hidden"
          )}
          disabled={disableOnPre}
        />
      </PanelFormRow>
      <PanelFormRow label="Хүргэх цаг" icon={ClockIcon}>
        <div className="flex items-center gap-1">
          <TimeField
            aria-label="Хүргэх цаг"
            hourCycle={24}
            isDisabled={disableOnPre}
            value={timeValue}
            onChange={(next) => {
              const nextTime = next ? next.toString().slice(0, 5) : ""
              if (nextTime && nextTime !== time)
                setDueDate(changeTimeOfDate(dueDate, nextTime))
            }}
            className="min-w-0 flex-1"
          >
            <DateInput
              unstyled
              className="flex h-7 w-full items-center rounded-sm px-2 text-xs tabular-nums outline-hidden transition-[color,box-shadow,background-color] hover:bg-accent data-[disabled=true]:opacity-60 data-[focus-within=true]:bg-background data-[focus-within=true]:shadow-focus [&>[data-type=hour]]:w-[2.75ch] [&>[data-type=hour]]:text-center [&>[data-type=minute]]:w-[2.75ch] [&>[data-type=minute]]:text-center"
            />
          </TimeField>
          {!!dueDate && (
            <Button
              variant="ghost"
              aria-label="Хүргэх хугацааг арилгах"
              className="size-7 flex-none rounded-sm p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setDueDate(undefined)}
              disabled={disableOnPre}
            >
              <EraserIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </PanelFormRow>
    </>
  )
}

export default Delivery

"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar, CalendarProps } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({
  date,
  setDate,
  disabled,
  selectedDays,
  className,
  ...props
}: CalendarProps & {
  date?: Date
  setDate: (date: Date | undefined) => void
  selectedDays?: Date[]
}) {
  return (
    <Popover>
      <PopoverTrigger asChild={true}>
        <Button
          variant={"outline"}
          className={cn(
            "w-[250px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={!!disabled}
        >
          {date ? (
            format(new Date(date), "yyyy-MM-dd")
            ) : (
              <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          {...props}
          disabled={selectedDays}
          mode="single"
          selected={date}
          onSelect={(e) => setDate(e)}
          initialFocus={true}
        />
      </PopoverContent>
    </Popover>
  )
}

"use client"

import * as React from "react"
import { mn } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const navButtonClassName = cn(
  buttonVariants({ variant: "outline" }),
  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
)

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      locale={mn}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "space-y-4",
        month_caption: "flex h-7 items-center justify-center pt-1",
        caption_label: "font-medium text-xs",
        nav: "absolute inset-x-1 top-0 z-10 flex items-center justify-between",
        button_previous: navButtonClassName,
        button_next: navButtonClassName,
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-slate-500 rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "text-center p-0 relative aria-selected:bg-slate-100 first:aria-selected:rounded-l-md last:aria-selected:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 font-normal"
        ),
        today: "[&>button]:bg-slate-100 [&>button]:text-slate-900",
        selected:
          "[&>button]:bg-slate-900 [&>button]:text-slate-50! [&>button]:hover:bg-slate-900 [&>button]:hover:text-slate-50 [&>button]:focus:bg-slate-900 [&>button]:focus:text-slate-50",
        outside: "text-slate-500 opacity-50",
        disabled: "text-slate-500 opacity-50",
        range_middle:
          "[&>button]:bg-slate-100! [&>button]:text-slate-900!",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

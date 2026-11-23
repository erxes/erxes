import { forwardRef, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import { useRecordTable } from "./RecordTableProvider"

const measureInnerWidth = (element: HTMLElement) => {
  const style = getComputedStyle(element)
  return (
    element.clientWidth -
    Number.parseFloat(style.paddingLeft) -
    Number.parseFloat(style.paddingRight)
  )
}

export const RecordTableScroll = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  const { setAvailableWidth } = useRecordTable()
  const innerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = innerRef.current
    if (!element) return
    const update = () => setAvailableWidth(measureInnerWidth(element))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [setAvailableWidth])

  return (
    <div
      ref={(element) => {
        innerRef.current = element
        if (typeof ref === "function") ref(element)
        else if (ref) ref.current = element
      }}
      className={cn("h-full w-full overflow-auto pb-3 pr-3", className)}
      {...props}
    >
      {children}
    </div>
  )
})
RecordTableScroll.displayName = "RecordTableScroll"

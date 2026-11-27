import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { usePanelExpanded } from "./RecordSidePanel"

const useIsClamped = (expanded: boolean) => {
  const ref = useRef<HTMLSpanElement>(null)
  const [isClamped, setIsClamped] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const check = () =>
      setIsClamped(element.scrollHeight > element.clientHeight + 1)
    const resizeObserver = new ResizeObserver(check)
    resizeObserver.observe(element)
    return () => resizeObserver.disconnect()
  }, [expanded])

  return { ref, isClamped }
}

export const PanelLabel = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const expanded = usePanelExpanded()
  const { ref, isClamped } = useIsClamped(expanded)
  const showTooltip = isClamped && !expanded

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            ref={ref}
            className={cn(
              "my-1 block min-w-0 wrap-break-word",
              !expanded && "line-clamp-2",
              className
            )}
          >
            {children}
          </span>
        </TooltipTrigger>
        {showTooltip && <TooltipContent>{children}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  )
}

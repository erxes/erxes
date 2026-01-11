"use client"

import React from "react"
import { motion } from "framer-motion"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu"

import { cn } from "@/lib/utils"

import { Button as Btn } from "./button"

const Button = motion(Btn)

export type ItemType = React.ReactElement<{
  /**
      Required. id for every item, should be unique
     */
  itemId: string
}>

type scrollVisibilityApiType = React.ContextType<typeof VisibilityContext>

export interface ItemProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  itemId: string | number
}

export const HorizontalScrollMenu = ({
  children,
  className,
  separatorClassName,
}: {
  children: ItemType | ItemType[]
  className?: string
  separatorClassName?: string
}) => {
  const { dragStart, dragStop, dragMove, dragging } = useDrag()

  const handleDrag =
    ({ scrollContainer }: scrollVisibilityApiType) =>
    (ev: React.MouseEvent) =>
      dragMove(ev, (posDiff) => {
        if (scrollContainer.current) {
          scrollContainer.current.scrollLeft += posDiff
        }
      })
  return (
    <div
      className="relative flex-auto flex-col overflow-hidden"
      onMouseLeave={dragStop}
    >
      <ScrollMenu
        scrollContainerClassName={cn(
          "flex overflow-y-hidden scrollbar-hide",
          className
        )}
        separatorClassName={separatorClassName}
        wrapperClassName="flex flex-col"
        onWheel={onWheel}
        onMouseDown={() => dragStart}
        onMouseUp={() => dragStop}
        onMouseMove={handleDrag}
        LeftArrow={LeftArrow}
        RightArrow={RightArrow}
      >
        {children}
      </ScrollMenu>
    </div>
  )
}

export const ScrollMenuItem = ({ itemId, ...props }: ItemProps) => (
  <div {...props} />
)

function Arrow({
  children,
  disabled,
  className,
  onClick,
  animate,
}: {
  children: React.ReactNode
  disabled: boolean
  onClick: VoidFunction
  className?: string
  animate?: object
}) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      variant="ghost"
      size="sm"
      className={cn(
        "absolute inset-y-0 h-auto rounded-none bg-white",
        className
      )}
      animate={{ ...animate, opacity: disabled ? 0 : 1 }}
    >
      {children}
    </Button>
  )
}

export function LeftArrow() {
  const {
    isFirstItemVisible,
    scrollPrev,
    visibleItemsWithoutSeparators,
    initComplete,
  } = React.useContext(VisibilityContext)

  const [disabled, setDisabled] = React.useState(
    !initComplete || (initComplete && isFirstItemVisible)
  )
  React.useEffect(() => {
    // NOTE: detect if whole component visible
    if (visibleItemsWithoutSeparators.length) {
      setDisabled(isFirstItemVisible)
    }
  }, [isFirstItemVisible, visibleItemsWithoutSeparators])

  return (
    <Arrow
      disabled={disabled}
      onClick={() => scrollPrev()}
      animate={{ left: disabled ? "-100%" : 0 }}
    >
      <ChevronLeftIcon className="h-4 w-4" />
    </Arrow>
  )
}

export function RightArrow() {
  const { isLastItemVisible, scrollNext, visibleItemsWithoutSeparators } =
    React.useContext(VisibilityContext)

  const [disabled, setDisabled] = React.useState(
    !visibleItemsWithoutSeparators.length && isLastItemVisible
  )
  React.useEffect(() => {
    if (visibleItemsWithoutSeparators.length) {
      setDisabled(isLastItemVisible)
    }
  }, [isLastItemVisible, visibleItemsWithoutSeparators])

  return (
    <Arrow
      disabled={disabled}
      onClick={() => scrollNext()}
      animate={{ right: disabled ? "-100%" : 0 }}
    >
      <ChevronRightIcon className="h-4 w-4" />
    </Arrow>
  )
}

function onWheel(apiObj: scrollVisibilityApiType, ev: React.WheelEvent): void {
  const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15

  if (isThouchpad) {
    ev.stopPropagation()
    return
  }

  if (ev.deltaY < 0) {
    apiObj.scrollPrev()
  } else if (ev.deltaY > 0) {
    apiObj.scrollNext()
  }
}

export function useDrag() {
  const [clicked, setClicked] = React.useState(false)
  const [dragging, setDragging] = React.useState(false)
  const position = React.useRef(0)

  const dragStart = React.useCallback((ev: React.MouseEvent) => {
    position.current = ev.clientX
    setClicked(true)
  }, [])

  const dragStop = React.useCallback(
    () =>
      // NOTE: need some delay so item under cursor won't be clicked
      window.requestAnimationFrame(() => {
        setDragging(false)
        setClicked(false)
      }),
    []
  )

  const dragMove = (ev: React.MouseEvent, cb: (posDif: number) => void) => {
    const newDiff = position.current - ev.clientX

    const movedEnough = Math.abs(newDiff) > 5

    if (clicked && movedEnough) {
      setDragging(true)
    }

    if (dragging && movedEnough) {
      position.current = ev.clientX
      cb(newDiff)
    }
  }

  return {
    dragStart,
    dragStop,
    dragMove,
    dragging,
    position,
    setDragging,
  }
}

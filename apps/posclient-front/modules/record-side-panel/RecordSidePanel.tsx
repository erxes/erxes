"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { MaximizeIcon, MinimizeIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type {
  PanelExpansionContextValue,
  RecordSidePanelHeaderProps,
  RecordSidePanelLayoutProps,
  RecordSidePanelResizeHandleProps,
  RecordSidePanelRootProps,
  RecordSidePanelTabsProps,
} from "./RecordSidePanelTypes"

export const SIDE_PANEL_WIDTH = { min: 320, max: 600, default: 400 }

const clampWidth = (width: number, min: number, max: number) =>
  Math.min(Math.max(width, min), max)

const PanelExpansionContext = createContext<PanelExpansionContextValue>(null)

export const usePanelExpanded = () =>
  Boolean(useContext(PanelExpansionContext)?.expanded)

const RecordSidePanelResizeHandle = ({
  width,
  minWidth = SIDE_PANEL_WIDTH.min,
  maxWidth,
  onWidthChange,
}: RecordSidePanelResizeHandleProps) => {
  const [dragging, setDragging] = useState(false)

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.preventDefault()
    const panel = event.currentTarget.parentElement
    if (!panel) return
    const startX = event.clientX
    const startWidth = panel.getBoundingClientRect().width || width
    let nextWidth = startWidth
    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    setDragging(true)

    const move = (moveEvent: PointerEvent) => {
      nextWidth = clampWidth(
        startWidth - (moveEvent.clientX - startX),
        minWidth,
        maxWidth
      )
      panel.style.width = `${nextWidth}px`
    }
    const end = () => {
      document.removeEventListener("pointermove", move)
      document.removeEventListener("pointerup", end)
      document.removeEventListener("pointercancel", end)
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      setDragging(false)
      onWidthChange(Math.round(nextWidth))
    }
    document.addEventListener("pointermove", move)
    document.addEventListener("pointerup", end)
    document.addEventListener("pointercancel", end)
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Хэмжээ өөрчлөх"
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      aria-valuenow={width}
      data-resizing={dragging || undefined}
      onPointerDown={handlePointerDown}
      onDoubleClick={() => onWidthChange(SIDE_PANEL_WIDTH.default)}
      className="group absolute inset-y-0 -left-1.5 z-20 flex w-3 cursor-col-resize touch-none items-center justify-center"
    >
      <span className="relative z-10 h-10 w-1 rounded-full bg-border opacity-0 transition group-hover:bg-primary/60 group-hover:opacity-100 group-data-[resizing=true]:bg-primary group-data-[resizing=true]:opacity-100" />
    </div>
  )
}

const RecordSidePanelRoot = ({
  className,
  width = SIDE_PANEL_WIDTH.default,
  maxWidth = SIDE_PANEL_WIDTH.max,
  onWidthChange,
  expanded: controlledExpanded,
  expandedMode = "viewport",
  onExpandedChange,
  expandable = true,
  children,
}: RecordSidePanelRootProps) => {
  const [internalExpanded, setInternalExpanded] = useState(false)
  const expanded = controlledExpanded ?? internalExpanded

  const toggle = useCallback(() => {
    setInternalExpanded(!expanded)
    onExpandedChange?.(!expanded)
  }, [expanded, onExpandedChange])
  const expansion = useMemo(
    () => ({ expanded, toggle: expandable ? toggle : undefined }),
    [expanded, expandable, toggle]
  )
  const upperBound = Math.max(SIDE_PANEL_WIDTH.min, maxWidth)
  const panelWidth = clampWidth(width, SIDE_PANEL_WIDTH.min, upperBound)

  return (
    <PanelExpansionContext.Provider value={expansion}>
      <aside
        data-record-side-panel
        data-expanded={expanded || undefined}
        style={{ width: expanded ? "100%" : panelWidth }}
        className={cn(
          "relative flex min-h-0 max-w-full flex-none flex-col border-l bg-background",
          expanded &&
            (expandedMode === "page"
              ? "relative h-full min-w-0 flex-1 border-l-0"
              : "fixed inset-0 z-40 h-svh border-l-0"),
          !expanded &&
            "animate-in fade-in-0 slide-in-from-right-8 duration-200 ease-out motion-reduce:animate-none",
          className
        )}
      >
        {onWidthChange && !expanded && (
          <RecordSidePanelResizeHandle
            width={panelWidth}
            maxWidth={upperBound}
            onWidthChange={onWidthChange}
          />
        )}
        {children}
      </aside>
    </PanelExpansionContext.Provider>
  )
}

const RecordSidePanelHeader = ({
  className,
  avatar,
  title,
  actions,
  onClose,
}: RecordSidePanelHeaderProps) => {
  const expansion = useContext(PanelExpansionContext)
  const expand = expansion?.toggle
  const expanded = Boolean(expansion?.expanded)
  const expandLabel = expanded ? "Жижигрүүлэх" : "Томруулах"

  useEffect(() => {
    if (!expand) return undefined
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.key !== "Enter" ||
        !event.shiftKey ||
        !(event.ctrlKey || event.metaKey) ||
        event.altKey
      )
        return
      const target = event.target
      if (
        target instanceof Element &&
        target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="menu"]'
        )
      )
        return
      event.preventDefault()
      expand()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [expand])

  return (
    <div
      className={cn(
        "box-content flex h-10 flex-none items-center gap-1 border-b bg-sidebar px-2",
        className
      )}
    >
      {avatar}
      <div className="min-w-0 flex-1 truncate px-1 text-sm font-medium">
        {title}
      </div>
      {actions && (
        <div className="flex flex-none items-center gap-1">{actions}</div>
      )}
      {expand && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={expand}
          title={`${expandLabel} (Ctrl/⌘ + Shift + Enter)`}
          aria-label={expandLabel}
          aria-expanded={expanded}
          aria-keyshortcuts="Control+Shift+Enter Meta+Shift+Enter"
        >
          {expanded ? (
            <MinimizeIcon className="size-4" />
          ) : (
            <MaximizeIcon className="size-4" />
          )}
        </Button>
      )}
      {onClose && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={onClose}
          title="Хаах"
          aria-label="Хаах"
        >
          <XIcon className="size-4" />
        </Button>
      )}
    </div>
  )
}

const RECORD_OVERVIEW_WIDTH = 360

const RecordSidePanelTabs = ({
  tabs,
  value,
  onValueChange,
  overviewTab,
  overviewHeader,
  expandedDefaultTab,
}: RecordSidePanelTabsProps) => {
  const expanded = usePanelExpanded()
  const splitOverview = expanded && Boolean(overviewTab)
  const navigationTabs = splitOverview
    ? tabs.filter((tab) => tab.value !== overviewTab)
    : tabs
  const selectedValue =
    splitOverview && value === overviewTab
      ? expandedDefaultTab || navigationTabs[0]?.value || value
      : value

  let contentLayout = "flex flex-col"
  let navigationLayout =
    "box-content h-9 items-center gap-1 border-b bg-background px-2"
  if (splitOverview) {
    contentLayout =
      "grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)] md:grid-cols-[var(--record-overview-width)_minmax(0,1fr)] md:grid-rows-[auto_minmax(0,1fr)]"
    navigationLayout =
      "col-start-1 row-start-2 box-content h-9 items-center gap-1 border-b bg-background px-3 md:col-start-2 md:row-start-1"
  } else if (expanded) {
    contentLayout = "flex flex-row"
    navigationLayout =
      "w-14 flex-col overflow-y-auto border-r bg-sidebar p-2 sm:w-48 sm:p-3"
  }
  const verticalNav = expanded && !splitOverview

  return (
    <Tabs
      value={selectedValue}
      onValueChange={onValueChange}
      orientation={verticalNav ? "vertical" : "horizontal"}
      className={cn("min-h-0 min-w-0 flex-1", contentLayout)}
      style={
        splitOverview
          ? ({
              "--record-overview-width": `${RECORD_OVERVIEW_WIDTH}px`,
            } as React.CSSProperties)
          : undefined
      }
    >
      <div
        className={cn(
          "flex min-w-0 flex-none overflow-hidden",
          navigationLayout
        )}
      >
        <TabsList
          aria-label="Бичлэгийн цэс"
          className={cn(
            "flex h-auto min-w-0 items-stretch gap-1 rounded-none bg-transparent p-0 text-zinc-400",
            verticalNav ? "flex-col" : "h-full"
          )}
        >
          {navigationTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              title={verticalNav ? tab.label : undefined}
              className={cn(
                "relative text-xs font-medium text-zinc-500 shadow-none hover:bg-accent data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none motion-reduce:transition-none",
                verticalNav
                  ? "h-9 justify-start gap-2.5 rounded-md px-2.5 data-[state=active]:bg-primary/10 data-[state=active]:hover:bg-primary/10"
                  : "h-full gap-1.5 rounded-none px-3 after:absolute after:inset-x-0 after:bottom-0 after:-mb-px after:h-0.5 data-[state=active]:after:bg-primary"
              )}
            >
              <tab.icon className="size-4 shrink-0" aria-hidden="true" />
              <span
                className={verticalNav ? "sr-only sm:not-sr-only" : undefined}
              >
                {tab.label}
              </span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "tabular-nums text-zinc-400",
                    verticalNav && "sr-only sm:not-sr-only"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => {
        const isOverview = splitOverview && tab.value === overviewTab

        return (
          <TabsContent
            key={tab.value}
            value={tab.value}
            forceMount={isOverview || undefined}
            className={cn(
              "mt-0 min-h-0 min-w-0 flex-1 flex-col",
              isOverview
                ? "relative col-start-1 row-start-1 flex border-b bg-background md:row-span-2 md:border-b-0 md:border-r"
                : "data-[state=active]:flex data-[state=inactive]:hidden data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:duration-150 motion-reduce:animate-none",
              splitOverview &&
                !isOverview &&
                "col-start-1 row-start-3 md:col-start-2 md:row-start-2"
            )}
          >
            {isOverview && overviewHeader && (
              <div className="box-content flex h-9 min-w-0 flex-none items-center gap-2 border-b px-3">
                {overviewHeader}
              </div>
            )}
            {tab.content}
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

const RecordSidePanelLayout = ({
  header,
  overviewTab,
  ...props
}: RecordSidePanelLayoutProps) => {
  const detailTab =
    overviewTab ??
    props.tabs.find((tab) => tab.value === "detail" || tab.value === "overview")
      ?.value

  return (
    <>
      {header}
      <RecordSidePanelTabs {...props} overviewTab={detailTab} />
    </>
  )
}

export const RecordSidePanel = Object.assign(RecordSidePanelRoot, {
  Header: RecordSidePanelHeader,
  Layout: RecordSidePanelLayout,
  Tabs: RecordSidePanelTabs,
})

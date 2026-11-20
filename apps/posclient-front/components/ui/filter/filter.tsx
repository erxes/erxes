"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { Command as CommandPrimitive } from "cmdk"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListFilterIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CommandItem } from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  DateFilterCommand,
  DateRangeDialogContent,
  getDisplayValue,
} from "./date-filter"

export type FilterValue = string | string[] | null

type FilterContextValue = {
  values: Record<string, FilterValue>
  setValue: (key: string, value: FilterValue) => void
  open: boolean
  setOpen: (open: boolean) => void
  view: string
  setView: (view: string) => void
  dialogView: string
  setDialogView: (view: string) => void
  openDialog: boolean
  setOpenDialog: (open: boolean) => void
  resetFilterState: () => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

export const useFilterContext = () => {
  const context = useContext(FilterContext)
  if (!context) throw new Error("useFilterContext must be used within Filter")
  return context
}

export const useFilterValue = (key: string) => {
  const { values, setValue } = useFilterContext()
  return [
    values[key] ?? null,
    (value: FilterValue) => setValue(key, value),
  ] as const
}

const isEmptyValue = (value: FilterValue) =>
  value === null || (Array.isArray(value) && !value.length) || value === ""

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

const FilterProvider = ({
  children,
  values,
  onValueChange,
}: {
  children: React.ReactNode
  values: Record<string, FilterValue>
  onValueChange: (key: string, value: FilterValue) => void
}) => {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState("root")
  const [dialogView, setDialogView] = useState("root")
  const [openDialog, setOpenDialog] = useState(false)

  const resetFilterState = () => {
    setOpen(false)
    setView("root")
    setDialogView("root")
    setOpenDialog(false)
  }

  return (
    <FilterContext.Provider
      value={{
        values,
        setValue: (key, value) =>
          onValueChange(key, isEmptyValue(value) ? null : value),
        open,
        setOpen,
        view,
        setView,
        dialogView,
        setDialogView,
        openDialog,
        setOpenDialog,
        resetFilterState,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

const FilterTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & { isFiltered?: boolean }
>(({ isFiltered, className, ...props }, ref) => (
  <TooltipProvider>
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="ghost"
            className={cn(
              "h-7 gap-2 rounded text-[13px] font-medium",
              isFiltered ? "-ml-1.5 w-7 px-0" : "-ml-2 px-2",
              className
            )}
            {...props}
          >
            <ListFilterIcon className="h-4 w-4" />
            {!isFiltered && "Шүүлтүүр"}
          </Button>
        </PopoverTrigger>
      </TooltipTrigger>
      <TooltipContent>Шүүлтүүр</TooltipContent>
    </Tooltip>
  </TooltipProvider>
))
FilterTrigger.displayName = "FilterTrigger"

const FilterPopover = ({ children }: { children: React.ReactNode }) => {
  const { open, setOpen, setView } = useFilterContext()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "f" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target) ||
        document.querySelector("[role=dialog]")
      )
        return
      event.preventDefault()
      setView("root")
      setOpen(true)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [setOpen, setView])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setView("root")
      }}
    >
      {children}
    </Popover>
  )
}

const FilterContent = React.forwardRef<
  React.ComponentRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, ...props }, ref) => (
  <PopoverContent
    ref={ref}
    align="start"
    sideOffset={8}
    className={cn(
      "w-(--radix-popper-anchor-width) min-w-72 max-w-96 p-0",
      className
    )}
    {...props}
  />
))
FilterContent.displayName = "FilterContent"

const FilterCommandInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    hotkey?: boolean
  }
>(({ className, hotkey, ...props }, ref) => (
  <div className="relative flex items-center border-b bg-background">
    <CommandPrimitive.Input
      ref={ref}
      autoFocus
      className={cn(
        "flex h-8 w-full rounded-md bg-transparent px-3 text-[13px] font-medium outline-hidden placeholder:text-muted-foreground/70",
        hotkey && "pr-8",
        className
      )}
      {...props}
    />
    {hotkey && (
      <Kbd className="absolute right-2 top-1/2 h-5 min-w-5 -translate-y-1/2 border border-foreground/20 bg-foreground/10 font-sans text-xs text-foreground/70 shadow-none">
        F
      </Kbd>
    )}
  </div>
))
FilterCommandInput.displayName = "FilterCommandInput"

export const filterItemClass =
  "h-8 gap-2 rounded-sm px-2 text-[13px] font-medium text-foreground [&>svg]:h-4 [&>svg]:w-4 [&>svg]:shrink-0"

const FilterItem = React.forwardRef<
  React.ComponentRef<typeof CommandItem>,
  Omit<React.ComponentPropsWithoutRef<typeof CommandItem>, "value"> & {
    value: string
    label?: string
    inDialog?: boolean
    active?: boolean
  }
>(({ children, value, label, inDialog, active, className, ...props }, ref) => {
  const { setDialogView, setOpenDialog, setOpen, setView } = useFilterContext()

  return (
    <CommandItem
      ref={ref}
      value={label || value}
      onSelect={() => {
        if (inDialog) {
          setDialogView(value)
          setOpenDialog(true)
          setOpen(false)
          return
        }
        setView(value)
      }}
      className={cn(filterItemClass, active && "text-primary", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </CommandItem>
  )
})
FilterItem.displayName = "FilterItem"

const FilterCommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem>
>(({ className, onSelect, ...props }, ref) => {
  const { setOpen } = useFilterContext()

  return (
    <CommandItem
      ref={ref}
      className={cn(filterItemClass, className)}
      onSelect={(value) => {
        setOpen(false)
        onSelect?.(value)
      }}
      {...props}
    />
  )
})
FilterCommandItem.displayName = "FilterCommandItem"

const FilterBackButton = () => {
  const { setView } = useFilterContext()

  return (
    <button
      type="button"
      onClick={() => setView("root")}
      className="flex h-8 w-full items-center gap-1 border-b px-2 text-[13px] text-muted-foreground hover:text-foreground"
    >
      <ChevronLeftIcon className="h-4 w-4" />
      Буцах
    </button>
  )
}

const FilterViewNesting = createContext(false)

const FilterView = ({
  children,
  filterKey = "root",
  inDialog,
}: {
  children: React.ReactNode
  filterKey?: string
  inDialog?: boolean
}) => {
  const { view, dialogView } = useFilterContext()
  const isNested = useContext(FilterViewNesting)

  if (inDialog ? dialogView !== filterKey : view !== filterKey) return null

  if (inDialog || filterKey === "root" || isNested) return <>{children}</>

  return (
    <FilterViewNesting.Provider value={true}>
      <FilterBackButton />
      {children}
    </FilterViewNesting.Provider>
  )
}

const FilterDialog = ({ children }: { children: React.ReactNode }) => {
  const { openDialog, setOpenDialog, resetFilterState } = useFilterContext()

  return (
    <Dialog
      open={openDialog}
      onOpenChange={(next) => {
        setOpenDialog(next)
        if (!next) resetFilterState()
      }}
    >
      {children}
    </Dialog>
  )
}

const FilterDialogStringView = ({
  filterKey,
  label,
}: {
  filterKey: string
  label?: string
}) => {
  const { resetFilterState } = useFilterContext()
  const [query, setQuery] = useFilterValue(filterKey)
  const [text, setText] = useState(typeof query === "string" ? query : "")
  const isSearch = !label && filterKey === "searchValue"
  const placeholder = isSearch ? "Хайх утгаа оруулна уу" : label

  return (
    <DialogContent className="sm:max-w-md">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setQuery(text.trim() || null)
          resetFilterState()
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {isSearch ? "Хайх" : label}
          </DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder={placeholder}
          aria-label={placeholder}
          className="my-4 h-8 text-[13px]"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <DialogFooter className="sm:space-x-3">
          <Button
            type="button"
            variant="outline"
            className="h-8 rounded px-3 text-[13px] font-semibold"
            onClick={resetFilterState}
          >
            Болих
          </Button>
          <Button
            type="submit"
            className="h-8 rounded px-3 text-[13px] font-semibold"
          >
            Хэрэглэх
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const FilterDialogDateView = ({
  filterKey,
  label,
}: {
  filterKey: string
  label: string
}) => {
  const { resetFilterState } = useFilterContext()
  const [value, setValue] = useFilterValue(filterKey)

  return (
    <DateRangeDialogContent
      label={label}
      value={typeof value === "string" ? value : null}
      onCancel={resetFilterState}
      onApply={(next) => {
        setValue(next)
        resetFilterState()
      }}
    />
  )
}

const FilterPopoverDateView = ({
  filterKey,
  label,
}: {
  filterKey: string
  label: string
}) => {
  const { resetFilterState, setDialogView, setOpenDialog, setOpen } =
    useFilterContext()
  const [value, setValue] = useFilterValue(filterKey)

  return (
    <DateFilterCommand
      label={label}
      selected={typeof value === "string" ? value : ""}
      onSelect={(next) => {
        setValue(next)
        resetFilterState()
      }}
      onCustom={() => {
        setOpen(false)
        setDialogView(filterKey)
        setOpenDialog(true)
      }}
    />
  )
}

const FilterBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-1 flex-wrap items-center gap-2", className)}
    {...props}
  />
))
FilterBar.displayName = "FilterBar"

const FilterBarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { queryKey: string }
>(({ className, queryKey, children, ...props }, ref) => {
  const [query] = useFilterValue(queryKey)

  if (isEmptyValue(query)) return null

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-7 items-stretch gap-px rounded bg-muted text-[13px] font-medium shadow-xs",
        className
      )}
      {...props}
    >
      {children}
      <FilterBarCloseButton filterKey={queryKey} />
    </div>
  )
})
FilterBarItem.displayName = "FilterBarItem"

const FilterBarName = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex w-fit items-center gap-2 rounded-l bg-background px-2 [&>svg]:h-4 [&>svg]:w-4",
      className
    )}
    {...props}
  />
))
FilterBarName.displayName = "FilterBarName"

const FilterBarButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    inDialog?: boolean
    filterKey?: string
  }
>(({ className, inDialog, filterKey, onClick, ...props }, ref) => {
  const { setDialogView, setOpenDialog } = useFilterContext()

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      className={cn(
        "h-7 max-w-72 rounded-none bg-background px-3 text-[13px] font-medium outline-hidden transition-[color,box-shadow] focus-visible:z-10 focus-visible:shadow-focus focus-visible:outline-transparent",
        className
      )}
      onClick={(event) => {
        if (inDialog) {
          setDialogView(filterKey ?? "root")
          setOpenDialog(true)
        }
        onClick?.(event)
      }}
      {...props}
    />
  )
})
FilterBarButton.displayName = "FilterBarButton"

const FilterBarCloseButton = ({ filterKey }: { filterKey: string }) => {
  const [, setQuery] = useFilterValue(filterKey)

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-7 w-7 rounded-none rounded-r bg-background p-0"
      onClick={() => setQuery(null)}
    >
      <XIcon className="h-4 w-4" />
    </Button>
  )
}

const FilterBarDate = ({
  filterKey,
  label,
}: {
  filterKey: string
  label: string
}) => {
  const { setDialogView, setOpenDialog } = useFilterContext()
  const [value, setValue] = useFilterValue(filterKey)
  const [open, setOpen] = useState(false)
  const selected = typeof value === "string" ? value : ""

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterBarButton>{getDisplayValue(selected)}</FilterBarButton>
      </PopoverTrigger>
      <FilterContent>
        <DateFilterCommand
          label={label}
          selected={selected}
          onSelect={(next) => {
            setValue(next)
            setOpen(false)
          }}
          onCustom={() => {
            setOpen(false)
            setDialogView(filterKey)
            setOpenDialog(true)
          }}
        />
      </FilterContent>
    </Popover>
  )
}

const FilterSearchValueTrigger = () => (
  <FilterItem value="searchValue" label="Хайх" inDialog>
    <SearchIcon />
    Хайх
  </FilterItem>
)

const FilterSearchValueBarItem = () => {
  const [searchValue] = useFilterValue("searchValue")

  return (
    <FilterBarItem queryKey="searchValue">
      <FilterBarName>
        <SearchIcon />
        Хайх
      </FilterBarName>
      <FilterBarButton filterKey="searchValue" inDialog>
        <span className="truncate">{searchValue}</span>
      </FilterBarButton>
    </FilterBarItem>
  )
}

export const Filter = Object.assign(FilterProvider, {
  Trigger: FilterTrigger,
  Popover: FilterPopover,
  Content: FilterContent,
  Item: FilterItem,
  CommandItem: FilterCommandItem,
  CommandInput: FilterCommandInput,
  View: FilterView,
  Dialog: FilterDialog,
  DialogStringView: FilterDialogStringView,
  DialogDateView: FilterDialogDateView,
  DateView: FilterPopoverDateView,
  Bar: FilterBar,
  BarItem: FilterBarItem,
  BarName: FilterBarName,
  BarButton: FilterBarButton,
  BarClose: FilterBarCloseButton,
  Date: FilterBarDate,
  SearchValueTrigger: FilterSearchValueTrigger,
  SearchValueBarItem: FilterSearchValueBarItem,
})

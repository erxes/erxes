"use client"

import React, { useEffect, useState } from "react"
import { Command as CommandPrimitive } from "cmdk"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ListFilterIcon,
  SearchIcon,
  XIcon,
} from "lucide-react"

import { useRemoveQueryStateByKey } from "@/lib/useQueryState"
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
  filterDialogButtonClass,
  filterDialogClass,
  filterDialogOverlayClass,
  filterInputClass,
  filterItemClass,
} from "../constants/filterClassNames"
import { FilterContext } from "../context/FilterContext"
import { DateFilterCommand } from "../date-filter/components/DateFilterCommand"
import { FilterDialogDateView } from "../date-filter/components/DialogDateView"
import { getDisplayValue } from "../date-filter/utils/getDisplayValue"
import { useFilterContext } from "../hooks/useFilterContext"
import { useFilterQueryState } from "../hooks/useFilterQueryState"
import {
  filterDialogViewState,
  filterPageState,
  filterPopoverViewState,
  openDialogState,
  openPopoverState,
} from "../states/filterStates"

const FILTER_LABEL = "Шүүлтүүр"

const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))

const FilterProvider = ({
  children,
  id,
  sessionKey,
}: {
  children: React.ReactNode
  id: string
  sessionKey?: string
}) => {
  const setOpen = useSetAtom(openPopoverState(id))
  const setView = useSetAtom(filterPopoverViewState(id))
  const setDialogView = useSetAtom(filterDialogViewState(id))
  const setOpenDialog = useSetAtom(openDialogState(id))

  const resetFilterState = () => {
    setOpen(false)
    setView("root")
    setDialogView("root")
    setOpenDialog(false)
  }

  return (
    <FilterContext.Provider
      value={{
        id,
        sessionKey,
        resetFilterState,
        setOpen,
        setView,
        setDialogView,
        setOpenDialog,
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

const FilterTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    isFiltered?: boolean
  }
>(({ isFiltered, className, ...props }, ref) => (
  <TooltipProvider>
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="ghost"
            aria-label={FILTER_LABEL}
            className={cn(
              "h-7 gap-2 rounded text-[13px] font-medium",
              isFiltered ? "-ml-1.5 w-7 px-0" : "-ml-2 px-2",
              className
            )}
            {...props}
          >
            <ListFilterIcon className="size-4" />
            {!isFiltered && FILTER_LABEL}
          </Button>
        </PopoverTrigger>
      </TooltipTrigger>
      <TooltipContent>{FILTER_LABEL}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
))
FilterTrigger.displayName = "FilterTrigger"

const FilterPopover = ({ children }: { children: React.ReactNode }) => {
  const { id } = useFilterContext()
  const [open, setOpen] = useAtom(openPopoverState(id))
  const setView = useSetAtom(filterPopoverViewState(id))

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
      onOpenChange={(op) => {
        setOpen(op)
        if (op) setView("root")
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
    {...props}
    className={cn(
      "w-(--radix-popper-anchor-width) min-w-72 max-w-96 overflow-hidden rounded-md bg-background p-0",
      className
    )}
  />
))
FilterContent.displayName = "FilterContent"

const FilterItem = React.forwardRef<
  React.ComponentRef<typeof CommandItem>,
  Omit<React.ComponentPropsWithoutRef<typeof CommandItem>, "value"> & {
    value: string
    label?: string
    inDialog?: boolean
    active?: boolean
  }
>(({ children, value, label, inDialog, className, active, ...props }, ref) => {
  const { setDialogView, setOpenDialog, setOpen, setView } = useFilterContext()

  const onSelect = () => {
    if (inDialog) {
      setDialogView(value)
      setOpenDialog(true)
      setOpen(false)
    } else {
      setView(value)
    }
  }

  return (
    <CommandItem
      value={label || value}
      onSelect={onSelect}
      ref={ref}
      className={cn(
        filterItemClass,
        active && "text-primary aria-selected:text-primary",
        className
      )}
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

  const handleSelect = (value: string) => {
    setOpen(false)
    onSelect?.(value)
  }

  return (
    <CommandItem
      ref={ref}
      className={cn(filterItemClass, className)}
      onSelect={handleSelect}
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
      <ChevronLeftIcon className="size-4" />
      Буцах
    </button>
  )
}

const FilterViewNesting = React.createContext(false)

const FilterView = ({
  children,
  filterKey = "root",
  inDialog,
}: {
  children: React.ReactNode
  filterKey?: string
  inDialog?: boolean
}) => {
  const { id } = useFilterContext()
  const view = useAtomValue(filterPopoverViewState(id))
  const dialogView = useAtomValue(filterDialogViewState(id))
  const isNested = React.useContext(FilterViewNesting)

  if (inDialog ? dialogView !== filterKey : view !== filterKey) {
    return null
  }

  if (inDialog || filterKey === "root" || isNested) {
    return <>{children}</>
  }

  return (
    <FilterViewNesting.Provider value={true}>
      <FilterBackButton />
      {children}
    </FilterViewNesting.Provider>
  )
}

const FilterDialog = ({ children }: { children: React.ReactNode }) => {
  const { id, setOpenDialog, resetFilterState } = useFilterContext()
  const openDialog = useAtomValue(openDialogState(id))

  return (
    <Dialog
      open={openDialog}
      onOpenChange={(open) => {
        setOpenDialog(open)
        if (!open) resetFilterState()
      }}
    >
      {children}
    </Dialog>
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
  React.HTMLAttributes<HTMLDivElement> & {
    queryKey?: string
  }
>(({ className, queryKey, children, ...props }, ref) => {
  const [query] = useFilterQueryState<unknown>(queryKey || "root")

  if (queryKey && (query === null || query === "")) {
    return null
  }

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
      "flex w-fit items-center gap-2 rounded-l bg-background px-2 [&>svg]:size-4",
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

const FilterBarCloseButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    filterKey?: string
  }
>(({ className, filterKey, ...props }, ref) => {
  const { sessionKey } = useFilterContext()
  const removeQuery = useRemoveQueryStateByKey()
  const setPage = useSetAtom(filterPageState(sessionKey ?? ""))

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      aria-label="Шүүлтүүр арилгах"
      className={cn(
        "h-7 w-7 rounded-none rounded-r bg-background p-0",
        className
      )}
      onClick={() => {
        removeQuery(filterKey ?? "")
        if (sessionKey) setPage(1)
      }}
      {...props}
    >
      <XIcon className="size-4" />
    </Button>
  )
})
FilterBarCloseButton.displayName = "FilterBarCloseButton"

const FilterDialogStringView = ({
  filterKey,
  label,
}: {
  filterKey: string
  label?: string
}) => {
  const { setDialogView, setOpenDialog, sessionKey, resetFilterState } =
    useFilterContext()
  const [query, setQuery] = useFilterQueryState<string>(filterKey, sessionKey)
  const [dialogSearch, setDialogSearch] = useState(query ?? "")

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const value = dialogSearch.trim()
    setQuery(value.length > 0 ? value : null)
    setDialogView("root")
    setOpenDialog(false)
  }

  const isSearch = !label && filterKey === "searchValue"
  const displayPlaceholder = isSearch
    ? "Хайх утгаа оруулна уу"
    : label || filterKey

  return (
    <DialogContent
      hideClose
      overlayClassName={filterDialogOverlayClass}
      className={filterDialogClass}
    >
      <form onSubmit={onSubmit}>
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            {isSearch ? "Хайх" : `${label || filterKey}-аар шүүх`}
          </DialogTitle>
        </DialogHeader>

        <Input
          autoFocus
          placeholder={displayPlaceholder}
          aria-label={displayPlaceholder}
          className="my-4 h-7 rounded-sm border-0 px-3 text-[13px] shadow-xs placeholder:text-zinc-400"
          value={dialogSearch}
          onChange={(e) => setDialogSearch(e.target.value)}
        />
        <DialogFooter className="sm:space-x-3">
          <Button
            type="button"
            variant="outline"
            className={filterDialogButtonClass}
            onClick={resetFilterState}
          >
            Болих
          </Button>
          <Button type="submit" className={filterDialogButtonClass}>
            Хэрэглэх
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const FilterPopoverDateView = ({
  filterKey,
  label,
}: {
  filterKey: string
  label?: string
}) => {
  const { resetFilterState, sessionKey } = useFilterContext()

  const [query, setQuery] = useFilterQueryState<string>(filterKey, sessionKey)

  return (
    <DateFilterCommand
      focusOnMount
      value={filterKey}
      label={label}
      selected={query ?? ""}
      onSelect={(value) => {
        setQuery(value)
        resetFilterState()
      }}
    />
  )
}

const FilterBarDate = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    filterKey: string
    label?: string
  }
>(({ filterKey, label, className, ...props }, ref) => {
  const { sessionKey } = useFilterContext()
  const [query, setQuery] = useFilterQueryState<string>(filterKey, sessionKey)
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FilterBarButton ref={ref} className={className} {...props}>
          {getDisplayValue(query ?? "")}
        </FilterBarButton>
      </PopoverTrigger>
      <FilterContent>
        <DateFilterCommand
          value={filterKey}
          label={label}
          selected={query ?? ""}
          onSelect={(val) => {
            setQuery(val)
            setOpen(false)
          }}
        />
      </FilterContent>
    </Popover>
  )
})
FilterBarDate.displayName = "FilterBarDate"

const FilterCommandInput = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    hotkey?: boolean
  }
>(({ className, hotkey = true, ...props }, ref) => (
  <div className="relative border-b bg-background">
    <CommandPrimitive.Input
      ref={ref}
      autoFocus
      className={cn(filterInputClass, hotkey && "pr-8", className)}
      {...props}
    />
    {hotkey && (
      <Kbd className="absolute right-2 top-1/2 h-5 min-w-5 -translate-y-1/2 rounded-md border border-foreground/20 bg-foreground/10 font-sans text-xs text-foreground opacity-70 shadow-none">
        F
      </Kbd>
    )}
  </div>
))
FilterCommandInput.displayName = "FilterCommandInput"

const FilterSearchValueTrigger = () => (
  <FilterItem value="searchValue" label="Хайх" inDialog>
    <SearchIcon />
    Хайх
  </FilterItem>
)

const FilterSearchValueBarItem = () => {
  const [searchValue] = useFilterQueryState<string>("searchValue")

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
  View: FilterView,
  SearchValueTrigger: FilterSearchValueTrigger,
  SearchValueBarItem: FilterSearchValueBarItem,
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
  CommandInput: FilterCommandInput,
})

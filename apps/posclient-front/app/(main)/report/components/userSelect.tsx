"use client"

import { forwardRef } from "react"
import { CheckIcon, ChevronsUpDownIcon, UsersIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type UserOption = { label: string; value: string }

type UserSelectProps = {
  options: UserOption[]
  values?: string[]
  onChange: (values: string[]) => void
}

const initials = (text: string) =>
  text.replace(/@.*/, "").slice(0, 2).toUpperCase() || "?"

export const UserSelect = forwardRef<HTMLButtonElement, UserSelectProps>(
  ({ options, values = [], onChange }, ref) => {
    const selected = options.filter((option) => values.includes(option.value))
    const allSelected = options.length > 0 && selected.length === options.length

    const toggle = (value: string) =>
      onChange(
        values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value]
      )

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            className="h-8 w-full justify-between gap-2 bg-background px-2 text-[13px] font-medium"
          >
            <span className="flex min-w-0 items-center gap-2">
              {selected.length ? (
                <span className="flex flex-none -space-x-1.5">
                  {selected.slice(0, 3).map((option) => (
                    <span
                      key={option.value}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary ring-2 ring-background"
                    >
                      {initials(option.label)}
                    </span>
                  ))}
                </span>
              ) : (
                <UsersIcon className="h-4 w-4 flex-none text-muted-foreground" />
              )}
              <span
                className={cn(
                  "truncate",
                  !selected.length && "font-normal text-muted-foreground"
                )}
              >
                {selected.length === 0
                  ? "Ажилтан сонгох"
                  : selected.length === 1
                    ? selected[0].label
                    : allSelected
                      ? "Бүх ажилчид"
                      : `${selected.length} ажилтан`}
              </span>
            </span>
            <ChevronsUpDownIcon className="h-3.5 w-3.5 flex-none text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popper-anchor-width) min-w-60 p-0"
        >
          <Command>
            <CommandInput placeholder="Ажилтан хайх..." />
            <CommandList>
              <CommandEmpty>Ажилтан олдсонгүй</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = values.includes(option.value)
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => toggle(option.value)}
                      className="gap-2"
                    >
                      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
                        {initials(option.label)}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {option.label}
                      </span>
                      <CheckIcon
                        className={cn(
                          "h-4 w-4 flex-none text-primary",
                          !isSelected && "invisible"
                        )}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {options.length > 1 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value="__toggle_all__"
                      onSelect={() =>
                        onChange(
                          allSelected
                            ? []
                            : options.map((option) => option.value)
                        )
                      }
                      className="justify-center text-xs font-medium text-muted-foreground"
                    >
                      {allSelected ? "Сонголт цуцлах" : "Бүгдийг сонгох"}
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

UserSelect.displayName = "UserSelect"

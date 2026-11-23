import { useId, useState } from "react"
import { resetAtom } from "@/store"
import { configAtom, configsAtom } from "@/store/config.store"
import { useMutation } from "@apollo/client"
import { useAtomValue, useSetAtom } from "jotai"
import { CheckIcon, ChevronsUpDown, Store } from "lucide-react"

import { cn, resetLocal } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import Loader from "@/components/ui/loader"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { onError } from "@/components/ui/use-toast"

import { mutations } from "./graphql"

export function ChooseConfig() {
  const [open, setOpen] = useState(false)
  const id = useId()
  const config = useAtomValue(configAtom)
  const configs = useAtomValue(configsAtom) ?? []
  const reset = useSetAtom(resetAtom)

  const [chooseConfig, { loading }] = useMutation(mutations.chooseConfig, {
    refetchQueries: ["CurrentConfig"],
    onCompleted: reset,
    onError({ message }) {
      onError(message)
    },
  })

  const selectedName =
    config?.name?.trim() || (config?.token ? "POS" : "Select point of sale")

  const handleChange = (token: string) => {
    setOpen(false)
    if (token === config?.token) return

    resetLocal()
    void chooseConfig({ variables: { token } })
  }

  return (
    <div className="grid gap-1">
      <Label id={`${id}-label`} className="sr-only">
        Point of sale
      </Label>
      {configs.length === 1 && config?.token ? (
        <div className="rounded-lg bg-foreground/5 p-1">
          <div className="flex min-h-7 items-center justify-center gap-2 rounded-md bg-background px-3 py-1 text-[13px] text-primary shadow-sm">
            <Store aria-hidden="true" className="size-4 shrink-0" />
            <span className="min-w-0 wrap-break-word">{selectedName}</span>
          </div>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <div className="rounded-lg bg-foreground/5 p-1">
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="h-7 w-full justify-start gap-2 rounded-md bg-background px-3 text-[13px] font-normal text-primary shadow-sm hover:bg-background"
                aria-labelledby={`${id}-label ${id}-value`}
                loading={loading}
              >
                <Store aria-hidden="true" className="size-4" />
                <span
                  id={`${id}-value`}
                  className="min-w-0 flex-1 truncate text-left"
                >
                  {selectedName}
                </span>
                <ChevronsUpDown
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent
            align="start"
            lang="en"
            className="w-(--radix-popover-trigger-width) border p-0"
          >
            <Command label="Select a point of sale">
              <CommandInput
                placeholder="Search points of sale..."
                className="h-11 text-base sm:text-sm"
              />
              <CommandList className="max-h-60">
                <CommandEmpty>No points of sale found.</CommandEmpty>
                <CommandGroup>
                  {configs.map((conf, index) => (
                    <CommandItem
                      key={conf.token}
                      value={String(index)}
                      keywords={[conf.name]}
                      className="min-h-10 gap-2.5 text-sm"
                      onSelect={() => handleChange(conf.token)}
                    >
                      <CheckIcon
                        aria-hidden="true"
                        className={cn(
                          "size-4 shrink-0 text-primary",
                          conf.token !== config?.token && "invisible"
                        )}
                      />
                      {conf.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
      {loading && <Loader className="fixed inset-0 z-50 bg-black/10" />}
    </div>
  )
}

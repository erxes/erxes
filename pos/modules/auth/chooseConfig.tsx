import { useState } from "react"
import { configAtom, configsAtom } from "@/store/config.store"
import { useMutation } from "@apollo/client"
import { useAtom } from "jotai"
import { CheckIcon, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

import { mutations } from "./graphql"

const ChooseConfig = () => {
  const [open, setOpen] = useState(false)

  const [config] = useAtom(configAtom)
  const [configs] = useAtom(configsAtom)
  const { onError } = useToast()

  const [chooseConfig, { loading }] = useMutation(mutations.chooseConfig, {
    refetchQueries: ["CurrentConfig"],
    onError,
  })

  const handleChange = (value: string) => {
    const lowerToken = value.split("_")[0]
    const token = (configs || []).find(
      (conf) => conf.token.toLowerCase() === lowerToken
    )?.token
    setOpen(false)
    return chooseConfig({ variables: { token } })
  }

  if (!configs || configs.length < 2) return null

  return (
    <div className="mb-3 space-y-1">
      <Label className="block">Choose pos</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={loading}
          >
            {config
              ? (configs || []).find(({ token }) => token === config?.token)
                  ?.name
              : "Select framework..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-screen max-w-sm p-0">
          <Command>
            <CommandInput placeholder="Пос хайх..." className="h-9" />
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              <div className="max-h-[300px] overflow-y-auto">
                {(configs || []).map((conf) => (
                  <CommandItem
                    key={conf.token}
                    value={conf.token + "_" + conf.name}
                    onSelect={handleChange}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 h-4 w-4",
                        conf.token === config?.token
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {conf.name}
                  </CommandItem>
                ))}
              </div>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default ChooseConfig

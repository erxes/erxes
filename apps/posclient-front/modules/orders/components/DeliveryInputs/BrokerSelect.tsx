"use client"

import React, { useEffect, useState } from "react"
import {
  activeOrderIdAtom,
  brokerAtom,
  brokerTypeAtom,
} from "@/store/order.store"
import { brokerPopoverAtom } from "@/store/ui.store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue } from "jotai"
import {
  Building2Icon,
  Check,
  ChevronsUpDown,
  UserCheckIcon,
  UserCircleIcon,
  XIcon,
} from "lucide-react"

import { Customer } from "@/types/customer.types"
import { cn, getCustomerLabel } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

import { queries } from "../../../customer/graphql"
import useOrderCU from "../../hooks/useOrderCU"

type BrokerTypeValue = "customer" | "company" | "user"

const placeholder = (type: BrokerTypeValue) => {
  if (type === "company") return "Брокер: Байгууллага"
  if (type === "user") return "Брокер: Ажилтан"
  return "Брокер: Хэрэглэгч"
}

const BrokerTypeButton = () => {
  const [type, setType] = useAtom(brokerTypeAtom)
  const [, setBroker] = useAtom(brokerAtom)

  const cycle = () => {
    setBroker(null)
    if (type === "customer") return setType("company")
    if (type === "company") return setType("user")
    return setType("customer")
  }

  return (
    <Button onClick={cycle} variant="outline" className="px-2.5">
      {type === "customer" && <UserCircleIcon className="h-5 w-5" />}
      {type === "company" && <Building2Icon className="h-5 w-5" />}
      {type === "user" && <UserCheckIcon className="h-5 w-5" />}
    </Button>
  )
}

const BrokerSelect = () => {
  const [open, setOpen] = useAtom(brokerPopoverAtom)
  const [broker, setBroker] = useAtom(brokerAtom)
  const [brokerType] = useAtom(brokerTypeAtom)
  const _id = useAtomValue(activeOrderIdAtom)
  const { orderCU } = useOrderCU()
  const [value, setValue] = React.useState("")
  const [searchValue, setSearchValue] = useState("")

  const { loading, data } = useQuery(queries.poscCustomers, {
    fetchPolicy: "network-only",
    variables: { searchValue: value, type: brokerType },
    skip: !searchValue,
  })

  const { poscCustomers } = data || {}

  useEffect(() => {
    const id = setTimeout(() => setSearchValue(value), 500)
    return () => clearTimeout(id)
  }, [value])

  const handleSelect = (entity: Customer) => {
    setBroker(entity._id === broker?._id ? null : entity)
    setValue("")
    setOpen(false)
    if (_id) setTimeout(orderCU, 100)
  }

  const handleClear = () => {
    setBroker(null)
    if (_id) setTimeout(orderCU, 100)
  }

  return (
    <div className="flex items-center gap-1 relative">
      <BrokerTypeButton />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-2"
          >
            {broker ? (
              getCustomerLabel(broker)
            ) : (
              <span>{`${placeholder(
                brokerType as BrokerTypeValue
              )} сонгох`}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {broker && (
          <Button
            variant="secondary"
            className="h-5 w-5 p-0.5 rounded-full absolute right-2 top-1/2 -translate-y-1/2"
            onClick={handleClear}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
        <PopoverContent className="w-(--radix-popper-anchor-width) p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`${placeholder(brokerType as BrokerTypeValue)} хайх`}
              onValueChange={(v) => setValue(v)}
              value={value}
            />
            <CommandEmpty>
              {loading
                ? "Хайж байна..."
                : `${placeholder(brokerType as BrokerTypeValue)} олдсонгүй`}
            </CommandEmpty>
            {!!(poscCustomers || []).length && (
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {(poscCustomers || []).map((entity: Customer) => (
                    <CommandItem
                      key={entity._id}
                      value={entity._id}
                      onSelect={() => handleSelect(entity)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          broker?._id === entity._id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {getCustomerLabel(entity)}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default BrokerSelect

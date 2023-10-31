import React, { useEffect, useState } from "react"
import { customerAtom, customerTypeAtom } from "@/store/order.store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue } from "jotai"
import { Check, ChevronsUpDown } from "lucide-react"

import { Customer, CustomerType as CustomerTypeT } from "@/types/customer.types"
import { cn } from "@/lib/utils"
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

import CustomerType from "./CustomerType"
import { queries } from "./graphql"
const placeHolder = (type: CustomerTypeT) => {
  if (type === "company") return "Байгууллага"
  if (type === "user") return "Ажилтан"
  return "Хэрэглэгч"
}
const Customer = () => {
  const [open, setOpen] = React.useState(false)
  const [customer, setCustomer] = useAtom(customerAtom)
  const customerType = useAtomValue(customerTypeAtom)
  const [value, setValue] = React.useState("")
  const [searchValue, setSearchValue] = useState("")

  const { loading, data } = useQuery(queries.poscCustomers, {
    fetchPolicy: "network-only",
    variables: {
      searchValue: value,
      type: customerType,
    },
    skip: !searchValue,
  })

  const { poscCustomers } = data || {}

  useEffect(() => {
    const timeOutId = setTimeout(() => setSearchValue(value), 500)
    return () => clearTimeout(timeOutId)
  }, [value, setSearchValue])

  const getCustomerLabel = ({ firstName, lastName, primaryPhone }: Customer) =>
    `${firstName || ""} ${lastName || ""} ${primaryPhone || ""}`

  return (
    <div className="flex items-center gap-1">
      <CustomerType className="h-5 w-5" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {!!customer ? getCustomerLabel(customer) : `${placeHolder(customerType)} сонгох`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`${placeHolder(customerType)} хайх`}
              onValueChange={(value) => setValue(value)}
              value={value}
            />
            <CommandEmpty>
              {loading ? "Хайж байна..." :`${placeHolder(customerType)} олдсонгүй`}
            </CommandEmpty>
            {!!(poscCustomers || []).length && (
              <CommandGroup>
                <ScrollArea className="h-[300px]">
                  {(poscCustomers || []).map((cus: Customer) => (
                    <CommandItem
                      key={cus._id + "_" + value}
                      onSelect={() => {
                        setCustomer(cus._id === customer?._id ? null : cus)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          customer?._id === cus._id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {getCustomerLabel(cus)}
                    </CommandItem>
                  ))}{" "}
                </ScrollArea>
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default Customer

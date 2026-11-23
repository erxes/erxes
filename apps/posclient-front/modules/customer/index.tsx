import React, { useEffect, useState } from "react"
import {
  activeOrderIdAtom,
  customerAtom,
  customerTypeAtom,
} from "@/store/order.store"
import { customerPopoverAtom } from "@/store/ui.store"
import { useQuery } from "@apollo/client"
import { useAtom, useAtomValue } from "jotai"
import { Check, ChevronsUpDown, Plus, XIcon } from "lucide-react"

import {
  Customer as CustomerT,
  CustomerType as CustomerTypeT,
} from "@/types/customer.types"
import useKeyEvent from "@/lib/useKeyEvent"
import { cn, getCustomerLabel } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import Loader from "@/components/ui/loader"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

import useOrderCU from "../orders/hooks/useOrderCU"
import { CustomerAddDialog } from "./components/CustomerAddDialog"
import { LoyaltySummary } from "./components/LoyaltySummary"
import { PricingScheduleBanner } from "./components/PricingScheduleBanner"
import CustomerType from "./CustomerType"
import { queries } from "./graphql"
import { useCustomerForm } from "./hooks/useCustomerForm"
import { useLoyaltyPreviewSync } from "./hooks/useLoyaltyPreviewSync"

const placeHolder = (type: CustomerTypeT) => {
  if (type === "company") return "Байгууллага"
  if (type === "user") return "Ажилтан"
  return "Хэрэглэгч"
}
const Customer = () => {
  const _id = useAtomValue(activeOrderIdAtom)
  const [open, setOpen] = useAtom(customerPopoverAtom)
  const [customer, setCustomer] = useAtom(customerAtom)
  const [customerType, setCustomerType] = useAtom(customerTypeAtom)
  const [value, setValue] = React.useState("")
  const [searchValue, setSearchValue] = useState("")
  const [addOpen, setAddOpen] = useState(false)
  const { orderCU, loading: loadingCU } = useOrderCU()
  const isCustomerType = customerType !== "company" && customerType !== "user"
  const { canCreate, rows } = useCustomerForm(!isCustomerType)
  useKeyEvent(() => setOpen(true), "F9")
  useLoyaltyPreviewSync()

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

  const handleSelect = (cus: CustomerT) => {
    setCustomer(cus._id === customer?._id ? null : cus)
    setOpen(false)
    _id && setTimeout(orderCU, 100)
  }

  const handleCreated = (cus: CustomerT) => {
    setAddOpen(false)
    setCustomer(cus)
    _id && setTimeout(orderCU, 100)
  }

  const handleClean = () => {
    setCustomer(null)
    setCustomerType("")
  }

  return (
    <>
      <div className="relative flex items-center gap-2">
        <CustomerType className="size-4" />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="h-8 w-full justify-between rounded border-0 px-2.5 text-[13px] font-normal shadow-xs"
            >
              {!!customer ? (
                getCustomerLabel(customer)
              ) : (
                <span className="text-muted-foreground">
                  {`${placeHolder(customerType)} сонгох`}{" "}
                  <Kbd className="ml-1 px-1 text-[10px]">F9</Kbd>
                </span>
              )}
              <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          {!!customer && (
            <Button
              variant="secondary"
              className="absolute right-8 top-1/2 size-5 -translate-y-1/2 rounded-full p-0.5"
              onClick={handleClean}
            >
              <XIcon className="size-3.5" />
            </Button>
          )}
          <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={`${placeHolder(customerType)} хайх`}
                onValueChange={(value) => setValue(value)}
                value={value}
              />
              {/* The add row counts as an item, so CommandEmpty would never show. */}
              {(loading || !(poscCustomers || []).length) && (
                <div className="py-6 text-center text-sm">
                  {loading
                    ? "Хайж байна..."
                    : `${placeHolder(customerType)} олдсонгүй`}
                </div>
              )}
              {!!(poscCustomers || []).length && (
                <CommandGroup>
                  <ScrollArea className="h-[300px]">
                    {(poscCustomers || []).map((cus: CustomerT) => (
                      <CommandItem
                        key={cus._id + "_" + value}
                        onSelect={() => handleSelect(cus)}
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
              {isCustomerType && canCreate && (
                <CommandGroup className="border-t">
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setAddOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Хэрэглэгч нэмэх
                  </CommandItem>
                </CommandGroup>
              )}
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <LoyaltySummary />
      <PricingScheduleBanner />
      <CustomerAddDialog
        open={addOpen}
        rows={rows}
        search={value}
        onCreated={handleCreated}
        onClose={() => setAddOpen(false)}
      />
      {loadingCU && (
        <Loader className="absolute inset-0 bg-background/60 backdrop-blur-[1px]" />
      )}
    </>
  )
}

export default Customer

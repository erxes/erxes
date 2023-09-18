"use client"

import { customerSearchAtom } from "@/store"
import { customerAtom, customerTypeAtom } from "@/store/order.store"
import { customerPopoverAtom } from "@/store/ui.store"
import { useLazyQuery } from "@apollo/client"
import { AnimatePresence, motion } from "framer-motion"
import { useAtom } from "jotai"

import { CustomerType as CustomerTypeT } from "@/types/customer.types"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import CustomerType from "./CustomerType"
import { queries } from "./graphql"

const Content = motion(PopoverContent)

const placeHolder = (type: CustomerTypeT) => {
  if (type === "company") return "Байгууллага"
  if (type === "user") return "Ажилтан"
  return "Хэрэглэгч"
}

const Customer = () => {
  const [open, setOpen] = useAtom(customerPopoverAtom)
  const [customerType] = useAtom(customerTypeAtom)
  const [customer, setCustomer] = useAtom(customerAtom)
  const [value, setValue] = useAtom(customerSearchAtom)

  const [searchCustomer, { loading }] = useLazyQuery(
    queries.poscCustomerDetail,
    {
      fetchPolicy: "network-only",
      onCompleted(data) {
        const { poscCustomerDetail: detail } = data || {}
        if (detail) {
          const { _id, code, primaryPhone, firstName, primaryEmail, lastName } =
            detail
          return setCustomer({
            _id,
            code,
            primaryPhone,
            firstName,
            primaryEmail,
            lastName,
          })
        }
        return setCustomer(null)
      },
    }
  )

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    searchCustomer({
      variables: {
        _id: value,
        type: customerType,
      },
    })
  }
  const { firstName, lastName, primaryPhone } = customer || {}
  const customerInfo = !!customer
    ? `${firstName || ""} ${lastName || ""} ${primaryPhone || ""}`
    : "Хэрэглэгч олдсонгүй"

  return (
    <div className="relative flex-none">
      <Popover open={open} onOpenChange={() => setOpen((prev) => !prev)} modal>
        <PopoverTrigger asChild>
          <div className="absolute inset-x-0 -top-0" />
        </PopoverTrigger>
        <AnimatePresence>
          {open && (
            <Content
              animate={{
                opacity: 1,
                paddingBottom: "2rem",
              }}
              initial={{
                opacity: 0,
                paddingBottom: "1rem",
              }}
              style={{
                width: "calc(var(--radix-popper-anchor-width) + 2rem + 1px)",
              }}
              className="-translate-y-5 border-transparent"
              animateCss={false}
            >
              <form className="relative" onSubmit={handleSubmit}>
                <Input
                  className="pl-10"
                  placeholder={`${placeHolder(customerType)} хайх`}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="submit"
                  style={{
                    position: "absolute",
                    left: -9999,
                    width: 1,
                    height: 1,
                  }}
                  tabIndex={-1}
                />
                <CustomerType className="absolute left-3 top-1/2 h-5 w-5 -translate-y-2/4" />
                <p className="absolute top-full pt-2 font-bold">
                  {customerInfo}
                </p>
              </form>
            </Content>
          )}
        </AnimatePresence>
      </Popover>
      <div
        className="flex w-full items-center rounded-md border p-3"
        onClick={() => setOpen(true)}
      >
        <CustomerType readOnly className="-my-0.5 mr-2 h-5 w-5" />
        <p className="font-bold">
          {!!customer ? customerInfo : `${placeHolder(customerType)} хайх`}
        </p>
      </div>
    </div>
  )
}

export default Customer

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { filterItemClass } from "@/modules/filter"
import { RecordTable } from "@/modules/record-table"
import { detailIdAtom } from "@/store/history.store"
import { useSetAtom } from "jotai"
import { CopyIcon, PanelRightOpenIcon, ReceiptTextIcon } from "lucide-react"

import {
  Command,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"

import { OrderAuditLog } from "../../graphql/orderAudit"
import { logTarget } from "./orderLogUtils"

export const OrderLogItemAction = ({
  log,
  onOpen,
}: {
  log: OrderAuditLog
  onOpen: (id: string) => void
}) => {
  const router = useRouter()
  const setOrderDetailId = useSetAtom(detailIdAtom)
  const [open, setOpen] = useState(false)
  const target = logTarget(log)

  const run = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  const copyTarget = async () => {
    try {
      await navigator.clipboard.writeText(target)
      toast({ variant: "success", description: `${target} хууллаа` })
    } catch {
      toast({ variant: "destructive", description: "Хуулж чадсангүй" })
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <RecordTable.MoreButton className="h-full w-full" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-56 overflow-hidden rounded-md bg-background p-0"
      >
        <Command>
          <CommandList className="m-1 max-h-none">
            <CommandItem
              value="detail"
              className={filterItemClass}
              onSelect={run(() => onOpen(log._id))}
            >
              <PanelRightOpenIcon />
              Логийн дэлгэрэнгүй
            </CommandItem>
            <CommandItem
              value="order"
              className={filterItemClass}
              disabled={!log.orderId}
              onSelect={run(() => {
                if (!log.orderId) return
                setOrderDetailId(log.orderId)
                router.push("/history")
              })}
            >
              <ReceiptTextIcon />
              Захиалгын дэлгэрэнгүй
            </CommandItem>
            <CommandSeparator className="my-1" />
            <CommandItem
              value="copy"
              className={filterItemClass}
              onSelect={run(() => void copyTarget())}
            >
              <CopyIcon />
              Дугаар хуулах
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

"use client"

import { MinusIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { formatNum } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

import { QrCartItem } from "../types"

const QrCartSheet = ({
  open,
  onOpenChange,
  items,
  onChangeCount,
  onChangeNote,
  onSubmit,
  submitting,
  total,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: QrCartItem[]
  onChangeCount: (id: string, count: number) => void
  onChangeNote: (id: string, note: string) => void
  onSubmit: () => void
  submitting: boolean
  total: number
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="flex h-[92vh] flex-col p-0 sm:max-w-full"
      >
        <SheetHeader className="border-b p-4">
          <SheetTitle>Захиалгын сагс</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
              Сагс хоосон байна
            </div>
          ) : (
            <div className="divide-y">
              {items.map((it) => (
                <div key={it._id} className="space-y-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold leading-tight">
                        {it.productName}
                      </div>
                      <div className="mt-1 text-xs text-neutral-500">
                        {formatNum(it.unitPrice)}₮
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onChangeCount(it._id, it.count - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 active:bg-neutral-100"
                      >
                        {it.count === 1 ? (
                          <Trash2Icon className="h-4 w-4 text-red-500" />
                        ) : (
                          <MinusIcon className="h-4 w-4" />
                        )}
                      </button>
                      <span className="w-6 text-center text-sm font-bold">
                        {it.count}
                      </span>
                      <button
                        onClick={() => onChangeCount(it._id, it.count + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 active:bg-neutral-100"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <Textarea
                    value={it.description || ""}
                    onChange={(e) => onChangeNote(it._id, e.target.value)}
                    placeholder="Тэмдэглэл (хүсэлт, харшил, г.м)"
                    className="min-h-[36px] text-xs"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-neutral-600">Нийт дүн</span>
            <span className="text-base font-bold">{formatNum(total)}₮</span>
          </div>
          <Button
            onClick={onSubmit}
            disabled={items.length === 0 || submitting}
            loading={submitting}
            className="h-12 w-full text-base font-bold"
          >
            Захиалга илгээх
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default QrCartSheet

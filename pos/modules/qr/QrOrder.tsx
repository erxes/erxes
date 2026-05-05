"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { ShoppingCartIcon } from "lucide-react"

import { ORDER_STATUSES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import Loader from "@/components/ui/loader"
import { toast } from "@/components/ui/use-toast"

import QrCartSheet from "./components/QrCartSheet"
import QrMenu from "./components/QrMenu"
import { mutations, queries } from "./graphql"
import { QrCartItem, QrProduct } from "./types"

const QrOrder = ({ slotCode }: { slotCode: string }) => {
  const [items, setItems] = useState<QrCartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const { data: slotsData, loading: slotLoading } = useQuery(queries.qrSlot)

  const slot = useMemo(() => {
    const all = slotsData?.poscSlots || []
    return all.find((s: { code: string }) => s.code === slotCode)
  }, [slotsData, slotCode])

  const total = items.reduce((s, it) => s + it.unitPrice * it.count, 0)
  const totalCount = items.reduce((s, it) => s + it.count, 0)

  const handleAdd = (p: QrProduct) => {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.productId === p._id && !i.description
      )
      if (existing) {
        return prev.map((i) =>
          i._id === existing._id ? { ...i, count: i.count + 1 } : i
        )
      }
      return [
        ...prev,
        {
          _id: Math.random().toString(36).slice(2),
          productId: p._id,
          productName: p.name,
          unitPrice: p.unitPrice,
          count: 1,
          productImgUrl: p.attachment?.url,
        },
      ]
    })
    toast({ description: `${p.name} нэмэгдлээ` })
  }

  const handleChangeCount = (id: string, count: number) => {
    setItems((prev) =>
      count <= 0
        ? prev.filter((i) => i._id !== id)
        : prev.map((i) => (i._id === id ? { ...i, count } : i))
    )
  }

  const handleChangeNote = (id: string, note: string) =>
    setItems((prev) =>
      prev.map((i) => (i._id === id ? { ...i, description: note } : i))
    )

  const [submit, { loading: submitting }] = useMutation(mutations.qrOrderAdd, {
    onCompleted(data) {
      toast({
        description: `Захиалга илгээгдлээ: #${data?.ordersAdd?.number || ""}`,
      })
      setItems([])
      setCartOpen(false)
    },
    onError(err) {
      toast({
        variant: "destructive",
        description: err.message || "Алдаа гарлаа",
      })
    },
  })

  const handleSubmit = () => {
    if (!items.length) return
    submit({
      variables: {
        items: items.map((i) => ({
          _id: i._id,
          productId: i.productId,
          count: i.count,
          unitPrice: i.unitPrice,
          status: ORDER_STATUSES.NEW,
          description: i.description,
        })),
        totalAmount: total,
        type: "eat",
        slotCode,
        origin: "qr",
      },
    })
  }

  if (slotLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (!slot) {
    return (
      <div className="flex h-screen items-center justify-center px-6 text-center">
        <div>
          <div className="text-base font-bold">Ширээ олдсонгүй</div>
          <div className="mt-1 text-sm text-neutral-500">
            Ширээний QR кодыг дахин уншуулна уу.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col bg-neutral-50">
      <header className="flex items-center justify-between bg-primary px-4 py-3 text-white">
        <div>
          <div className="text-[10px] uppercase tracking-wider opacity-80">
            Ширээ
          </div>
          <div className="text-base font-bold leading-tight">{slot.name}</div>
        </div>
        <div className="text-right text-[10px] uppercase tracking-wider opacity-80">
          QR Self Order
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <QrMenu onAdd={handleAdd} />
      </main>

      {totalCount > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4">
          <Button
            onClick={() => setCartOpen(true)}
            className="pointer-events-auto h-14 w-full max-w-md rounded-full text-base font-bold shadow-lg"
          >
            <ShoppingCartIcon className="mr-2 h-5 w-5" />
            Сагс үзэх ({totalCount})
          </Button>
        </div>
      )}

      <QrCartSheet
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={items}
        onChangeCount={handleChangeCount}
        onChangeNote={handleChangeNote}
        onSubmit={handleSubmit}
        submitting={submitting}
        total={total}
      />
    </div>
  )
}

export default QrOrder

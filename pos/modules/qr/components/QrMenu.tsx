"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@apollo/client"

import { formatNum } from "@/lib/utils"
import Image from "@/components/ui/image"
import Loader from "@/components/ui/loader"

import { queries } from "../graphql"
import { QrCategory, QrProduct } from "../types"

const QrMenu = ({
  onAdd,
}: {
  onAdd: (product: QrProduct) => void
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("")
  const [search, setSearch] = useState<string>("")

  const { data: catData, loading: catLoading } = useQuery(queries.qrCategories)
  const { data: prodData, loading: prodLoading } = useQuery(queries.qrProducts, {
    variables: {
      categoryId: activeCategoryId || undefined,
      searchValue: search || undefined,
    },
  })

  const categories: QrCategory[] = useMemo(
    () => catData?.poscProductCategories || [],
    [catData]
  )
  const products: QrProduct[] = prodData?.poscProducts || []

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 bg-white p-3 shadow-sm">
        <input
          type="search"
          inputMode="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Хайх..."
          className="h-10 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 text-sm outline-none focus:border-primary"
        />
        <div className="-mx-3 mt-2 flex gap-1.5 overflow-x-auto px-3 pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategoryId("")}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
              !activeCategoryId
                ? "bg-primary text-white"
                : "bg-neutral-100 text-neutral-700"
            }`}
          >
            Бүгд
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setActiveCategoryId(c._id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                activeCategoryId === c._id
                  ? "bg-primary text-white"
                  : "bg-neutral-100 text-neutral-700"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 pb-32">
        {(catLoading || prodLoading) && !products.length ? (
          <div className="flex h-40 items-center justify-center">
            <Loader />
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-neutral-500">
            Бүтээгдэхүүн алга
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <button
                key={p._id}
                onClick={() => onAdd(p)}
                className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white text-left active:scale-[0.98]"
              >
                <div className="relative aspect-square w-full bg-neutral-100">
                  {p.attachment?.url ? (
                    <Image
                      src={p.attachment.url}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-1 p-2">
                  <div className="line-clamp-2 text-xs font-semibold leading-tight">
                    {p.name}
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {formatNum(p.unitPrice)}₮
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QrMenu

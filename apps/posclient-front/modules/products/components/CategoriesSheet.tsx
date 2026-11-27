import { useCallback, useMemo } from "react"
import { activeCategoryAtom, activeCatName, hiddenParentsAtom } from "@/store"
import { motion } from "framer-motion"
import { useAtom, useSetAtom } from "jotai"
import {
  ChevronRightIcon,
  FolderIcon,
  LayoutGridIcon,
  XIcon,
} from "lucide-react"

import { ICategory } from "@/types/product.types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SheetClose, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"

import useProductCategories from "../hooks/useProductCategories"

const CategoriesSheetNew = ({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const getCategoryByField = (value: string, field: keyof ICategory) =>
    categories.find((e) => e[field] === value)
  const setCatName = useSetAtom(activeCatName)
  const [activeCat, setActiveCat] = useAtom(activeCategoryAtom)
  const [hiddenParents, setHiddenParents] = useAtom(hiddenParentsAtom)

  const { categories, loading } = useProductCategories((cats) => {
    if (!hiddenParents.length) {
      const defaultHiddenCats: string[] = []
      cats.forEach((cat: ICategory) => {
        if (cat.order.split("/").length === 4) {
          !!cats.find(
            (e: ICategory) =>
              e.order?.includes(cat.order) && e.order.length > cat.order.length
          ) && defaultHiddenCats.push(cat.order)
        }
      })
      setHiddenParents(defaultHiddenCats)
    }
  })

  const sortedCategories = useMemo(
    () =>
      [...(categories || [])].sort(
        (a, b) => a.order.split("/").length - b.order.split("/").length
      ),
    [categories]
  )

  const clearCat = () => {
    setActiveCat("")
    setCatName("")
    setOpen(false)
  }

  const chooseCat = (_id: string) => {
    setActiveCat(activeCat === _id ? "" : _id)
    setCatName(getCategoryByField(_id, "_id")?.name || "")
    setOpen(false)
  }

  const shortestLength = sortedCategories[0]?.order?.split("/").length

  const handleChangeView = useCallback(
    (cat: ICategory) => {
      const { order } = cat
      if (hiddenParents.includes(order)) {
        setHiddenParents(hiddenParents.filter((e) => e !== order))
      } else {
        setHiddenParents([...hiddenParents, order])
      }
    },
    [hiddenParents, setHiddenParents]
  )

  const checkIsHidden = useCallback(
    (order: string) => {
      const hiddenParent = hiddenParents.find(
        (e) => order.includes(e) && order.length > e.length
      )
      return !!hiddenParent
    },
    [hiddenParents]
  )

  const ordersWithChildren = useMemo(() => {
    const result = new Set<string>()

    categories.forEach((cat: ICategory) => {
      const order = cat.order

      if (
        order &&
        categories.some(
          (e: ICategory) =>
            e.order?.includes(order) && e.order.length > order.length
        )
      ) {
        result.add(order)
      }
    })

    return result
  }, [categories])

  const checkHasChildren = useCallback(
    (order: string) => ordersWithChildren.has(order),
    [ordersWithChildren]
  )

  const isHiddenChild = useCallback(
    (order: string) => hiddenParents.includes(order),
    [hiddenParents]
  )

  const rowClass =
    "flex h-9 w-full min-w-0 items-center gap-2 rounded-lg pr-2 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:shadow-focus"

  const renderList = () => {
    if (loading) {
      return (
        <div className="space-y-2 px-1 py-1">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded-lg" />
          ))}
        </div>
      )
    }

    if (!categories.length) {
      return (
        <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-sm text-muted-foreground">
          <FolderIcon className="h-6 w-6" />
          Ангилал бүртгэгдээгүй байна
        </div>
      )
    }

    return categories.map((cat) => {
      const depth = cat.order.split("/").length - shortestLength
      const hasChildren = checkHasChildren(cat.order)
      const isActive = activeCat === cat._id
      const hidden = checkIsHidden(cat.order)

      return (
        <motion.div
          className="overflow-hidden"
          key={cat._id}
          initial={false}
          animate={{
            height: hidden ? 0 : "auto",
            opacity: hidden ? 0 : 1,
          }}
        >
          <div
            className={cn(
              rowClass,

              isActive &&
                "bg-primary/10 font-semibold text-primary hover:bg-primary/10"
            )}
            style={{ paddingLeft: depth * 16 + 4 }}
          >
            {hasChildren ? (
              <button
                type="button"
                aria-label={isHiddenChild(cat.order) ? "Дэлгэх" : "Хураах"}
                className="flex h-6 w-6 flex-none items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground"
                onClick={() => handleChangeView(cat)}
              >
                <ChevronRightIcon
                  className={cn(
                    "h-4 w-4 transition-transform",
                    !isHiddenChild(cat.order) && "rotate-90"
                  )}
                />
              </button>
            ) : (
              <span className="w-6 flex-none" />
            )}
            <button
              type="button"
              className="h-full min-w-0 flex-auto truncate text-left"
              onClick={() => chooseCat(cat._id)}
            >
              {cat.name}
            </button>
          </div>
        </motion.div>
      )
    })
  }

  return (
    <>
      <div className="flex h-14 flex-none items-center justify-between border-b px-4">
        <SheetTitle className="text-base font-semibold">Ангилал</SheetTitle>
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Хаах"
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </SheetClose>
      </div>
      <div className="flex-none border-b p-2">
        <button
          type="button"
          className={cn(
            rowClass,
            "pl-2",
            !activeCat &&
              "bg-primary/10 font-semibold text-primary hover:bg-primary/10"
          )}
          onClick={clearCat}
        >
          <LayoutGridIcon className="h-4 w-4 flex-none" />
          Бүх бараа
        </button>
      </div>
      <ScrollArea className="min-h-0 flex-auto">
        <div className="space-y-0.5 p-2">{renderList()}</div>
      </ScrollArea>
    </>
  )
}

export default CategoriesSheetNew

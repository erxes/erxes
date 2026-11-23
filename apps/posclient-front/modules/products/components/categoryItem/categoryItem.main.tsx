import { activeCategoryAtom, activeCatName } from "@/store"
import { useQuery } from "@apollo/client"
import { useAtom, useSetAtom } from "jotai"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { queries } from "../../graphql"

const CategoryItem = ({ _id }: { _id: string }) => {
  const [activeCat, setActiveCat] = useAtom(activeCategoryAtom)
  const setCatName = useSetAtom(activeCatName)

  const { data, loading } = useQuery(queries.getInitialCategory, {
    variables: {
      _id,
    },
  })

  if (loading)
    return (
      <Button
        variant={"outline"}
        size="sm"
        className="h-7 rounded px-2.5 whitespace-nowrap"
      >
        <Skeleton style={{ width: 80 }} className="h-3" />
      </Button>
    )

  const { name } = data?.poscProductCategoryDetail || {}

  return (
    <Button
      variant="ghost"
      aria-pressed={activeCat === _id}
      size="sm"
      className={cn(
        "h-7 rounded border-0 px-3 text-[13px] font-medium whitespace-nowrap shadow-none",
        activeCat !== _id
          ? "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
          : "bg-primary/10 text-primary hover:bg-primary/15"
      )}
      onClick={() => {
        if (activeCat === _id) {
          setActiveCat("")
          setCatName("")
        } else {
          setActiveCat(_id)
          setCatName(name)
        }
      }}
    >
      {name}
    </Button>
  )
}

export default CategoryItem
